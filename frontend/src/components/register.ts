import { AuthUtils } from "../utils/auth-utils";
import { HttpUtils } from "../utils/http-utils";
import { RegisterRequest, RegisterResponse, ValidationError } from "../types/register.types";

export class Register {
    private openNewRoute: (route: string) => void;
    private nameElement: HTMLInputElement | null = null;
    private lastNameElement: HTMLInputElement | null = null;
    private emailElement: HTMLInputElement | null = null;
    private passwordElement: HTMLInputElement | null = null;
    private passwordRepeatElement: HTMLInputElement | null = null;
    private commonErrorElement: HTMLElement | null = null;
    private processButton: HTMLButtonElement | null = null;

    constructor(openNewRoute: (route: string) => void) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            this.openNewRoute('/');
            return;
        }

        this.nameElement = document.getElementById('name') as HTMLInputElement | null;
        this.lastNameElement = document.getElementById('last-name') as HTMLInputElement | null;
        this.emailElement = document.getElementById('email') as HTMLInputElement | null;
        this.passwordElement = document.getElementById('password') as HTMLInputElement | null;
        this.passwordRepeatElement = document.getElementById('password-repeat') as HTMLInputElement | null;
        this.commonErrorElement = document.getElementById('common-error');
        this.processButton = document.getElementById('process-button') as HTMLButtonElement | null;

        if (!this.nameElement || !this.lastNameElement || !this.emailElement ||
            !this.passwordElement || !this.passwordRepeatElement || !this.commonErrorElement ||
            !this.processButton) {
            console.error('Required DOM elements not found');
            return;
        }

        this.processButton.addEventListener('click', this.signUp.bind(this));
    }

    validateForm(): boolean {
        const nameElement = this.nameElement;
        const lastNameElement = this.lastNameElement;
        const emailElement = this.emailElement;
        const passwordElement = this.passwordElement;
        const passwordRepeatElement = this.passwordRepeatElement;

        let isValid = true;

        if (nameElement && nameElement.value.trim()) {
            nameElement.classList.remove('is-invalid');
        } else {
            nameElement?.classList.add('is-invalid');
            isValid = false;
        }

        if (lastNameElement && lastNameElement.value.trim()) {
            lastNameElement.classList.remove('is-invalid');
        } else {
            lastNameElement?.classList.add('is-invalid');
            isValid = false;
        }

        if (emailElement && emailElement.value && this.isValidEmail(emailElement.value)) {
            emailElement.classList.remove('is-invalid');
        } else {
            emailElement?.classList.add('is-invalid');
            isValid = false;
        }

        if (passwordElement && passwordElement.value && this.isValidPassword(passwordElement.value)) {
            passwordElement.classList.remove('is-invalid');
        } else {
            passwordElement?.classList.add('is-invalid');
            isValid = false;
        }

        if (passwordRepeatElement && passwordElement &&
            passwordRepeatElement.value &&
            passwordElement.value === passwordRepeatElement.value) {
            passwordRepeatElement.classList.remove('is-invalid');
        } else {
            passwordRepeatElement?.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email: string): boolean {
        const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return emailRegex.test(email);
    }

    isValidPassword(password: string): boolean {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
        return passwordRegex.test(password);
    }

    async signUp(): Promise<void> {
        const nameElement = this.nameElement;
        const lastNameElement = this.lastNameElement;
        const emailElement = this.emailElement;
        const passwordElement = this.passwordElement;
        const passwordRepeatElement = this.passwordRepeatElement;
        const commonErrorElement = this.commonErrorElement;
        const processButton = this.processButton;

        if (!nameElement || !lastNameElement || !emailElement || !passwordElement ||
            !passwordRepeatElement || !commonErrorElement || !processButton) {
            return;
        }

        commonErrorElement.style.display = 'none';

        if (this.validateForm()) {
            try {
                processButton.disabled = true;
                processButton.textContent = 'Регистрация...';

                const requestData: RegisterRequest = {
                    name: nameElement.value.trim(),
                    lastName: lastNameElement.value.trim(),
                    email: emailElement.value.trim(),
                    password: passwordElement.value,
                    passwordRepeat: passwordRepeatElement.value,
                };

                const result = await HttpUtils.request('/signup', 'POST', false, requestData);

                if (result.response && (result.response as RegisterResponse).validation) {
                    const validationErrors = (result.response as RegisterResponse).validation;
                    validationErrors?.forEach((error: ValidationError) => {
                        console.log(`Validation error: ${error.field} - ${error.message}`);
                    });
                }

                if (result.error || !result.response || !this.isValidRegisterResponse(result.response)) {
                    commonErrorElement.style.display = 'block';
                    processButton.disabled = false;
                    processButton.textContent = 'Зарегистрироваться';
                    return;
                }

                this.openNewRoute('/login');

            } catch (error) {
                console.error('Registration error:', error);
                if (commonErrorElement) {
                    commonErrorElement.style.display = 'block';
                }
                if (processButton) {
                    processButton.disabled = false;
                    processButton.textContent = 'Зарегистрироваться';
                }
            }
        } else {
            if (commonErrorElement) {
                commonErrorElement.style.display = 'block';
            }
        }
    }

    private isValidRegisterResponse(response: any): response is RegisterResponse {
        return !response.error;
    }
}