import { AuthUtils } from "../utils/auth-utils";
import { HttpUtils } from "../utils/http-utils";

type LoginRequest = {
    email: string;
    password: string;
    rememberMe: boolean;
};

type LoginResponse = {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    user: {
        id: string;
        name: string;
        lastName: string;
        email?: string;
    };
};

export class Login {
    private openNewRoute: (route: string) => void;
    private emailElement: HTMLInputElement | null = null;
    private passwordElement: HTMLInputElement | null = null;
    private rememberMeElement: HTMLInputElement | null = null;
    private commonErrorElement: HTMLElement | null = null;
    private processButton: HTMLButtonElement | null = null;

    constructor(openNewRoute: (route: string) => void) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            this.openNewRoute('/');
            return;
        }

        this.emailElement = document.getElementById('email') as HTMLInputElement | null;
        this.passwordElement = document.getElementById('password') as HTMLInputElement | null;
        this.rememberMeElement = document.getElementById('remember-me') as HTMLInputElement | null;
        this.commonErrorElement = document.getElementById('common-error');
        this.processButton = document.getElementById('process-button') as HTMLButtonElement | null;

        if (!this.emailElement || !this.passwordElement || !this.rememberMeElement ||
            !this.commonErrorElement || !this.processButton) {
            console.error('Required DOM elements not found');
            return;
        }

        this.processButton.addEventListener('click', this.login.bind(this));
    }

    validateForm(): boolean {
        const emailElement = this.emailElement;
        const passwordElement = this.passwordElement;

        let isValid = true;

        if (emailElement && emailElement.value && this.isValidEmail(emailElement.value)) {
            emailElement.classList.remove('is-invalid');
        } else {
            emailElement?.classList.add('is-invalid');
            isValid = false;
        }

        if (passwordElement && passwordElement.value && passwordElement.value.length >= 6) {
            passwordElement.classList.remove('is-invalid');
        } else {
            passwordElement?.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async login(): Promise<void> {
        const emailElement = this.emailElement;
        const passwordElement = this.passwordElement;
        const rememberMeElement = this.rememberMeElement;
        const commonErrorElement = this.commonErrorElement;
        const processButton = this.processButton;

        if (!emailElement || !passwordElement || !rememberMeElement || !commonErrorElement || !processButton) {
            return;
        }

        commonErrorElement.style.display = 'none';

        if (this.validateForm()) {
            try {
                processButton.disabled = true;
                processButton.textContent = 'Вход...';

                const requestData: LoginRequest = {
                    email: emailElement.value,
                    password: passwordElement.value,
                    rememberMe: rememberMeElement.checked
                };

                const result = await HttpUtils.request('/login', 'POST', false, requestData);

                if (result.error || !result.response || !this.isValidLoginResponse(result.response)) {
                    commonErrorElement.style.display = 'block';
                    processButton.disabled = false;
                    processButton.textContent = 'Войти';
                    return;
                }

                const loginResponse = result.response as LoginResponse;

                AuthUtils.setAuthInfo(
                    loginResponse.tokens.accessToken,
                    loginResponse.tokens.refreshToken,
                    {
                        id: loginResponse.user.id.toString(),
                        name: loginResponse.user.name,
                        lastName: loginResponse.user.lastName,
                        email: loginResponse.user.email
                    }
                );

                this.openNewRoute('/');

            } catch (error) {
                console.error('Login error:', error);
                if (commonErrorElement) {
                    commonErrorElement.style.display = 'block';
                }
                if (processButton) {
                    processButton.disabled = false;
                    processButton.textContent = 'Войти';
                }
            }
        } else {
            if (commonErrorElement) {
                commonErrorElement.style.display = 'block';
            }
        }
    }

    private isValidLoginResponse(response: any): response is LoginResponse {
        return (
            response &&
            response.tokens &&
            typeof response.tokens.accessToken === 'string' &&
            typeof response.tokens.refreshToken === 'string' &&
            response.user &&
            typeof response.user.id !== 'undefined' &&
            typeof response.user.name === 'string' &&
            typeof response.user.lastName === 'string'
        );
    }
}