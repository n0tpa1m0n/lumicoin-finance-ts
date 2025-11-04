import { AuthUtils } from "../utils/auth-utils";
import { UserInfo, BalanceResponse } from "../types/layout.types";

export class Layout {
    private isUserMenuOpen: boolean;

    constructor() {
        this.isUserMenuOpen = false;
        this.init();
        this.updateUserInfo();
    }

    init(): void {
        this.setupActiveState();
        this.setupDropdownBehavior();
        this.updateUserInfo();
        this.setupUserDropdown();
        this.setupHoverEffects();
    }

    updateUserInfo(): void {
        const userInfo = AuthUtils.getAuthInfo(AuthUtils.userInfoTokenKey);
        const userNameElement = document.querySelector('.user-name') as HTMLElement;

        if (userInfo && userNameElement) {
            try {
                const userInfoString = typeof userInfo === 'string' ? userInfo : JSON.stringify(userInfo);
                const userData: UserInfo = JSON.parse(userInfoString);
                if (userData.name && userData.lastName) {
                    userNameElement.textContent = `${userData.name} ${userData.lastName}`;
                }
            } catch (e) {
                console.error('Error parsing user info:', e);
            }
        }

        this.updateBalance();
    }

    async updateBalance(): Promise<void> {
        try {
            const authToken = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);

            const headers: Record<string, string> = {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            };

            if (authToken && typeof authToken === 'string') {
                headers['x-auth-token'] = authToken;
            }

            const result = await fetch('http://localhost:3000/api/balance', {
                method: 'GET',
                headers: headers
            });

            if (result.ok) {
                const data: BalanceResponse = await result.json();
                const balanceElement = document.getElementById('balance-amount');
                if (balanceElement && data.balance !== undefined) {
                    balanceElement.textContent = data.balance + '$';
                }
            }
        } catch (error) {
            console.error('Balance update error:', error);
        }
    }

    setupHoverEffects(): void {
        const navItems = document.querySelectorAll('.nav-item:not(.active)');

        navItems.forEach(navItem => {
            navItem.addEventListener('mouseenter', () => {
                this.updateNavItemIcons(navItem as HTMLElement, true);
            });

            navItem.addEventListener('mouseleave', () => {
                this.updateNavItemIcons(navItem as HTMLElement, false);
            });
        });
    }

    setupUserDropdown(): void {
        const userDropdown = document.getElementById('userDropdown');
        const userDropdownMenu = document.getElementById('userDropdownMenu');

        if (userDropdown && userDropdownMenu) {
            userDropdown.addEventListener('click', (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleUserMenu();
            });

            document.addEventListener('click', (e: Event) => {
                if (!userDropdown.contains(e.target as Node) && !userDropdownMenu.contains(e.target as Node)) {
                    this.closeUserMenu();
                }
            });

            userDropdownMenu.addEventListener('click', (e: Event) => {
                e.stopPropagation();
            });
        }
    }

    toggleUserMenu(): void {
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        if (userDropdownMenu) {
            if (this.isUserMenuOpen) {
                this.closeUserMenu();
            } else {
                this.openUserMenu();
            }
        }
    }

    openUserMenu(): void {
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        if (userDropdownMenu) {
            userDropdownMenu.style.display = 'block';
            this.isUserMenuOpen = true;
        }
    }

    closeUserMenu(): void {
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        if (userDropdownMenu) {
            userDropdownMenu.style.display = 'none';
            this.isUserMenuOpen = false;
        }
    }

    setupActiveState(): void {
        this.updateActiveNavItem(window.location.pathname);

        document.addEventListener('routeChanged', (e: Event) => {
            const customEvent = e as CustomEvent<{ route: string }>;
            this.updateActiveNavItem(customEvent.detail.route);
        });
    }

    updateActiveNavItem(activeRoute: string): void {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            this.updateNavItemIcons(item as HTMLElement, false);
        });

        let activeLink = this.findActiveNavLink(activeRoute);

        if (activeLink) {
            activeLink.classList.add('active');
            this.updateNavItemIcons(activeLink, true);

            activeLink.removeEventListener('mouseenter', () => {});
            activeLink.removeEventListener('mouseleave', () => {});

            this.openCategoriesForRelatedPages(activeRoute, activeLink);
        }

        this.setupHoverEffects();
    }

    findActiveNavLink(activeRoute: string): HTMLElement | null {
        let activeLink = document.querySelector(`a[href="${activeRoute}"]`) as HTMLElement;
        if (activeLink) return activeLink;

        const routeMappings: Record<string, string> = {
            '/transactions/create-transaction': '/transactions',
            '/transactions/edit-transactions': '/transactions',
            '/profit/create-profit': '/profit',
            '/profit/edit-profit': '/profit',
            '/categories': this.resolveCategoriesRoute()
        };

        for (const [route, targetRoute] of Object.entries(routeMappings)) {
            if (activeRoute === route || activeRoute.startsWith(route)) {
                activeLink = document.querySelector(`a[href="${targetRoute}"]`) as HTMLElement;
                if (activeLink) return activeLink;
            }
        }

        if (activeRoute === '/') {
            activeLink = document.querySelector('a[href="/"]') as HTMLElement;
        }

        return activeLink;
    }

    resolveCategoriesRoute(): string {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');

        if (category === 'income') {
            return '/profit';
        } else if (category === 'expense') {
            return '/costs';
        }

        return '/profit';
    }

    openCategoriesForRelatedPages(activeRoute: string, activeLink: HTMLElement): void {
        const dropdownCheckbox = document.getElementById('categories-toggle') as HTMLInputElement;
        if (!dropdownCheckbox) return;

        const categoryRelatedPages = [
            '/profit', '/costs',
            '/profit/create-profit', '/profit/edit-profit',
            '/categories'
        ];

        const isCategoryPage = categoryRelatedPages.includes(activeRoute) ||
            activeRoute.startsWith('/categories') ||
            activeRoute.startsWith('/profit/') ||
            activeRoute.startsWith('/costs/');

        if (isCategoryPage) {
            dropdownCheckbox.checked = true;
        }

        if (activeLink && activeLink.classList.contains('sub-item')) {
            dropdownCheckbox.checked = true;
        }
    }

    updateNavItemIcons(navItem: HTMLElement, showActive: boolean): void {
        const navItemIcon = navItem.querySelector('.nav-item-icon') as HTMLElement;
        if (navItemIcon) {
            const normalIcon = navItemIcon.querySelector('.normal-icon') as HTMLElement;
            const activeIcon = navItemIcon.querySelector('.active-icon') as HTMLElement;

            if (normalIcon && activeIcon) {
                if (showActive) {
                    normalIcon.classList.remove('d-block');
                    normalIcon.classList.add('d-none');
                    activeIcon.classList.remove('d-none');
                    activeIcon.classList.add('d-block');
                } else {
                    normalIcon.classList.remove('d-none');
                    normalIcon.classList.add('d-block');
                    activeIcon.classList.remove('d-block');
                    activeIcon.classList.add('d-none');
                }
            }
        }
    }

    setupDropdownBehavior(): void {
        document.addEventListener('click', (e: Event) => {
            const dropdown = document.querySelector('.dropdown');
            const checkbox = document.getElementById('categories-toggle') as HTMLInputElement;

            if (!dropdown || !checkbox) return;

            const keepOpenPages = [
                '/profit', '/costs',
                '/profit/create-profit', '/profit/edit-profit',
                '/categories'
            ];

            const shouldKeepOpen = keepOpenPages.includes(window.location.pathname) ||
                window.location.pathname.startsWith('/categories') ||
                window.location.pathname.startsWith('/profit/') ||
                window.location.pathname.startsWith('/costs/');

            if (!dropdown.contains(e.target as Node) && !shouldKeepOpen) {
                checkbox.checked = false;
            }
        });

        const dropdownList = document.querySelector('.dropdown-list');
        if (dropdownList) {
            dropdownList.addEventListener('click', (e: Event) => {
                e.stopPropagation();
            });
        }
    }

    static async setBalance(): Promise<void> {
        const layout = new Layout();
        await layout.updateBalance();
    }
}