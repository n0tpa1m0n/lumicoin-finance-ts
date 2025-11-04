import "./styles/styles.scss";
import { Router } from "./router";

declare global {
    interface Window {
        toggleMobileMenu: () => void;
        updateBalance: (amount: number) => void;
    }
}

class App {
    private router: Router;

    constructor() {
        this.init();
        this.router = new Router();
    }

    private init(): void {
        this.setupDropdown();
        this.setupMobileMenu();
        this.setupActiveStates();
    }

    private setupDropdown(): void {
        const dropdownHeader = document.querySelector<HTMLElement>('.dropdown-header');
        if (dropdownHeader) {
            dropdownHeader.addEventListener('click', () => {
                dropdownHeader.classList.toggle('open');
                const dropdownList = document.querySelector<HTMLElement>('.dropdown-list');
                if (dropdownList) {
                    dropdownList.classList.toggle('open');
                }
            });
        }
    }

    private setupActiveStates(): void {
        const navItems = document.querySelectorAll<HTMLElement>('.nav-item:not(.sub-item)');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (!item.classList.contains('dropdown-header')) {
                    navItems.forEach(navItem => navItem.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        });
    }

    private setupMobileMenu(): void {
        window.toggleMobileMenu = () => {
            const sidebar = document.querySelector<HTMLElement>('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('mobile-open');
            }
        };

        this.addMobileMenuButton();

        window.addEventListener('resize', () => this.addMobileMenuButton());

        document.addEventListener('click', (event: MouseEvent) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector<HTMLElement>('.sidebar');
                const menuBtn = document.querySelector<HTMLElement>('.mobile-menu-btn');

                const target = event.target as HTMLElement;

                if (
                    sidebar &&
                    sidebar.classList.contains('mobile-open') &&
                    !sidebar.contains(target) &&
                    (!menuBtn || !menuBtn.contains(target))
                ) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        });
    }

    private addMobileMenuButton(): void {
        if (window.innerWidth <= 768) {
            const existingBtn = document.querySelector<HTMLElement>('.mobile-menu-btn');
            if (!existingBtn) {
                const menuBtn = document.createElement('button');
                menuBtn.className = 'mobile-menu-btn';
                menuBtn.innerHTML = '☰';
                menuBtn.onclick = window.toggleMobileMenu;
                document.body.appendChild(menuBtn);
            }
        } else {
            const menuBtn = document.querySelector<HTMLElement>('.mobile-menu-btn');
            if (menuBtn) {
                menuBtn.remove();
            }
        }
    }
}

window.updateBalance = function (amount: number): void {
    const balanceElement = document.getElementById('balance-amount');
    if (balanceElement) {
        balanceElement.textContent = `${amount}$`;
    }
};

new App();
