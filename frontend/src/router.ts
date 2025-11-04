import { Layout } from "./components/layout";
import { RouteTypes } from "../src/types/route.types";

interface RouteAliases {
    [key: string]: string;
}

export class Router {
    readonly titlePageElement: HTMLElement | null;
    readonly contentPageElement: HTMLElement | null;
    readonly adminLteStyleElement: HTMLElement | null;
    private layout: Layout | null;
    private routes: RouteTypes[];
    private routeAliases: RouteAliases;

    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.adminLteStyleElement = document.getElementById('adminlte_style');
        this.layout = null;
        this.routeAliases = {};

        this.initEvents();
        this.routes = [
            {
                route: '/',
                title: 'Дашборд',
                filePathTemplate: '/templates/dashboard.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: async (): Promise<void> => {
                    new Layout();
                    const { Dashboard } = await import('./components/dashboard');
                    new Dashboard(this.openNewRoute.bind(this));
                },
                unload: (): void => {},
            },
            {
                route: '/costs',
                title: 'Расходы',
                filePathTemplate: '/templates/costs.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: async (): Promise<void> => {
                    new Layout();
                    const { Costs } = await import('./components/costs');
                    new Costs(this.openNewRoute.bind(this));
                },
                unload: (): void => {}
            },
            {
                route: '/profit',
                title: 'Доходы',
                filePathTemplate: '/templates/profit.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: async (): Promise<void> => {
                    new Layout();
                    const { Profit } = await import('./components/profit');
                    new Profit(this.openNewRoute.bind(this));
                },
                unload: (): void => {}
            },
            {
                route: '/transactions',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/transactions.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: async (): Promise<void> => {
                    const { Transactions } = await import('./components/transactions');
                    new Transactions(this.openNewRoute.bind(this));
                    new Layout();
                },
                unload: (): void => {},
            },
            {
                route: '/transactions/create-transaction',
                title: 'Создать транзакцию',
                filePathTemplate: '/templates/create-transaction.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: async (): Promise<void> => {
                    new Layout();
                    const { CreateTransaction } = await import('./components/create-transaction');
                    new CreateTransaction(this.openNewRoute.bind(this));
                },
                unload: (): void => {}
            },
            {
                route: '/transactions/edit-transactions',
                title: 'Редактировать транзакцию',
                filePathTemplate: '/templates/edit-transactions.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: async (): Promise<void> => {
                    new Layout();
                    const { EditTransactions } = await import('./components/edit-transactions');
                    new EditTransactions(this.openNewRoute.bind(this));
                },
                unload: (): void => {}
            },
            {
                route: '/profit/create-profit',
                title: 'Создать доход',
                filePathTemplate: '/templates/create-category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: async (): Promise<void> => {
                    new Layout();
                    const { CreateCategory } = await import('./components/create-category');
                    new CreateCategory(this.openNewRoute.bind(this));
                },
                unload: (): void => {}
            },
            {
                route: '/profit/edit-profit',
                title: 'Редактировать доход',
                filePathTemplate: '/templates/create-category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: async (): Promise<void> => {
                    new Layout();
                    const { CreateCategory } = await import('./components/create-category');
                    new CreateCategory(this.openNewRoute.bind(this));
                },
                unload: (): void => {}
            },
            {
                route: '/categories',
                title: 'Работа с категориями',
                filePathTemplate: '/templates/create-category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: async (): Promise<void> => {
                    new Layout();
                    const { CreateCategory } = await import('./components/create-category');
                    new CreateCategory(this.openNewRoute.bind(this));
                },
                unload: (): void => {}
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/404.html',
                useLayout: '/templates/layout.html',
                requiresAuth: false,
                load: (): Promise<void> => Promise.resolve(),
                unload: (): void => {}
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/login.html',
                useLayout: '', // Убрали layout
                requiresAuth: false,
                load: async (): Promise<void> => {
                    const { Login } = await import('./components/login');
                    new Login(this.openNewRoute.bind(this));
                },
                unload: (): void => {
                    document.body.style.height = 'auto';
                },
            },
            {
                route: '/register',
                title: 'Регистрация',
                filePathTemplate: '/templates/register.html',
                useLayout: '', // Убрали layout
                requiresAuth: false,
                load: async (): Promise<void> => {
                    const { Register } = await import('./components/register');
                    new Register(this.openNewRoute.bind(this));
                },
                unload: (): void => {
                    document.body.style.height = 'auto';
                },
            },
            {
                route: '/logout',
                title: '',
                filePathTemplate: '',
                useLayout: '',
                requiresAuth: false,
                load: async (): Promise<void> => {
                    const { Logout } = await import('./components/logout');
                    new Logout(this.openNewRoute.bind(this));
                },
                unload: (): void => {}
            },
        ];

        this.routeAliases = {
            '/create-transaction': '/transactions/create-transaction',
            '/edit-transactions': '/transactions/edit-transactions',
            '/create-profit': '/categories?type=create&category=income',
            '/edit-profit': '/categories?type=edit&category=income',
            '/create-costs': '/categories?type=create&category=expense',
            '/edit-costs': '/categories?type=edit&category=expense'
        };
    }

    private initEvents(): void {
        window.addEventListener('DOMContentLoaded', () => this.activateRoute());
        window.addEventListener('popstate', () => this.activateRoute());
        document.addEventListener('click', this.clickHandler.bind(this))
    }

    public async openNewRoute(url: string): Promise<void> {
        const currentRoute = window.location.pathname;
        history.pushState({}, '', url);
        await this.activateRoute(currentRoute);
    }

    private clickHandler(e: Event): void {
        const target = e.target as HTMLElement;
        let element: HTMLAnchorElement | null = null;

        if (target.nodeName === 'A') {
            element = target as HTMLAnchorElement;
        } else if (target.parentNode?.nodeName === 'A') {
            element = target.parentNode as HTMLAnchorElement;
        }

        if (element) {
            e.preventDefault();
            const url = element.href.replace(window.location.origin, '');
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) {
                return;
            }

            const currentRoute = window.location.pathname;
            history.pushState({}, '', url);
            this.activateRoute(currentRoute);
        }
    }

    private resolveRouteAlias(route: string): string {
        return this.routeAliases[route] || route;
    }

    private async activateRoute(oldRoute?: string): Promise<void> {
        if (oldRoute) {
            const currentRoute = this.routes.find(item => item.route === oldRoute);
            if (currentRoute && currentRoute.unload && typeof currentRoute.unload === 'function') {
                currentRoute.unload();
            }
        }

        let urlRoute = window.location.pathname;

        const resolvedRoute = this.resolveRouteAlias(urlRoute);
        if (resolvedRoute !== urlRoute) {
            history.replaceState({}, '', resolvedRoute);
            urlRoute = resolvedRoute;
        }

        let currentRoute: RouteTypes | undefined;
        if (urlRoute.startsWith('/categories')) {
            currentRoute = this.routes.find(item => item.route === '/categories');
        } else {
            currentRoute = this.routes.find(item => item.route === urlRoute);
        }

        if (currentRoute) {
            if (currentRoute.requiresAuth && !this.isAuthenticated()) {
                console.log('Требуется авторизация! Перенаправляем на /login');
                this.openNewRoute('/login');
                return;
            }

            if (currentRoute.title && this.titlePageElement) {
                this.titlePageElement.innerText = currentRoute.title + ' | Lumincoin Finance';
            }

            if (currentRoute.filePathTemplate && this.contentPageElement) {
                let contentBlock: HTMLElement | null = this.contentPageElement;

                if (currentRoute.useLayout) {
                    this.contentPageElement.innerHTML = await fetch(currentRoute.useLayout).then(response => response.text());
                    contentBlock = document.getElementById('content-layout');
                    document.body.classList.add('sidebar-mini', 'layout-fixed');

                    setTimeout(() => {
                        this.initLayout();
                    }, 50);
                } else {
                    this.contentPageElement.innerHTML = '';
                    document.body.classList.remove('sidebar-mini', 'layout-fixed');
                    contentBlock = this.contentPageElement;
                }

                if (contentBlock) {
                    try {
                        const templateContent = await fetch(currentRoute.filePathTemplate).then(response => response.text());
                        contentBlock.innerHTML = templateContent;
                    } catch (error) {
                        console.error('Error loading template:', currentRoute.filePathTemplate, error);
                        contentBlock.innerHTML = '<div class="alert alert-danger">Ошибка загрузки страницы</div>';
                    }
                }
            }

            if (currentRoute.load && typeof currentRoute.load === 'function') {
                try {
                    await currentRoute.load();
                } catch (error) {
                    console.error('Error in route load function:', error);
                }
            }

            this.updateActiveNavItem(urlRoute);

        } else {
            console.log('No route found for:', urlRoute);
            history.pushState({}, '', '/404');
            await this.activateRoute();
        }
    }

    private async initLayout(): Promise<void> {
        try {
            const { Layout } = await import('./components/layout');
            this.layout = new Layout();
        } catch (error) {
            console.error('Failed to load Layout:', error);
        }
    }

    private isAuthenticated(): boolean {
        const accessToken = localStorage.getItem('accessToken');
        return !!accessToken;
    }

    private updateActiveNavItem(activeRoute: string): void {
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems.length === 0) {
            return;
        }

        navItems.forEach(item => {
            item.classList.remove('active');
        });

        let routeToActivate = activeRoute;

        if (activeRoute.startsWith('/transactions/')) {
            routeToActivate = '/transactions';
        } else if (activeRoute.startsWith('/profit/')) {
            routeToActivate = '/profit';
        } else if (activeRoute.startsWith('/categories')) {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            routeToActivate = category === 'income' ? '/profit' : '/costs';
        }

        let activeLink = document.querySelector(`a[href="${routeToActivate}"]`) as HTMLAnchorElement;

        if (!activeLink && routeToActivate === '/') {
            activeLink = document.querySelector('a[href="/"]') as HTMLAnchorElement;
        }

        if (activeLink) {
            activeLink.classList.add('active');
            if (activeLink.classList.contains('sub-item')) {
                const dropdownCheckbox = document.getElementById('categories-toggle') as HTMLInputElement;
                if (dropdownCheckbox) {
                    dropdownCheckbox.checked = true;
                }
            }
        } else {
            console.log('No matching link found for route:', routeToActivate);
        }
    }
}