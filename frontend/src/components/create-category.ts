import { HttpUtils } from "../utils/http-utils";
import { CategoryType, OperationType, CategoryResponse } from "../types/create-category.types";

export class CreateCategory {
    private openNewRoute: (route: string) => void;
    private pageTitle: HTMLElement | null;
    private sendButton: HTMLButtonElement | null;
    private canselButton: HTMLButtonElement | null;
    private categoryInput: HTMLInputElement | null;
    private urlParams: URLSearchParams;
    private apiUrl: string = '';
    private currentCategoryId: string | null = null;

    constructor(openNewRoute: (route: string) => void) {
        this.openNewRoute = openNewRoute;
        this.pageTitle = document.getElementById("page-title");
        this.sendButton = document.getElementById("send-button") as HTMLButtonElement | null;
        this.canselButton = document.getElementById("cansel-button") as HTMLButtonElement | null;
        this.categoryInput = document.getElementById('input-name-category') as HTMLInputElement | null;
        this.urlParams = new URLSearchParams(window.location.search);

        if (!this.pageTitle || !this.sendButton || !this.categoryInput) {
            return;
        }

        if (this.canselButton) {
            this.canselButton.addEventListener('click', this.cancel.bind(this));
        }

        this.sendButton.addEventListener('click', this.handleSubmit.bind(this));

        this.initPage().then();
    }

    async initPage(): Promise<void> {
        const pageTitle = this.pageTitle;
        if (!pageTitle) {
            return;
        }

        const category = this.urlParams.get('category') as CategoryType | null;
        const type = this.urlParams.get('type') as OperationType | null;
        const id = this.urlParams.get('id');

        console.log('Params:', { category, type, id });

        if (!category || !type) {
            throw new Error('Не указаны обязательные параметры category или type');
        }

        this.apiUrl = category === 'income' ? '/categories/income' : '/categories/expense';

        if (type === 'edit') {
            pageTitle.innerText = 'Редактирование категории';
            if (id) {
                await this.loadCategoryData(id);
            } else {
                throw new Error('ID категории не указан для редактирования');
            }
        } else if (type === 'create') {
            pageTitle.innerText = 'Создание категории';
        } else {
            throw new Error('Неизвестный тип операции');
        }
    }

    async loadCategoryData(id: string): Promise<void> {
        try {
            const result = await HttpUtils.request(`${this.apiUrl}/${id}`, 'GET');

            if (result.error || !result.response) {
                alert('Ошибка загрузки категории: ' + (result as any).message);
                return;
            }

            const categoryData = result.response as CategoryResponse;

            const categoryInput = this.categoryInput;
            if (categoryData.title && categoryInput) {
                categoryInput.value = categoryData.title;
                this.currentCategoryId = id;
            }
        } catch (error) {
            console.error('Error loading category:', error);
            alert('Ошибка при загрузке данных категории');
        }
    }

    async handleSubmit(): Promise<void> {
        if (this.validateInput()) {
            const type = this.urlParams.get('type') as OperationType;

            if (type === 'create') {
                await this.createCategory();
            } else if (type === 'edit') {
                await this.editCategory();
            }
        }
    }

    validateInput(): boolean {
        const categoryInput = this.categoryInput;
        if (!categoryInput) {
            return false;
        }

        if (categoryInput.value.trim()) {
            categoryInput.classList.remove('is-invalid');
            return true;
        } else {
            categoryInput.classList.remove('is-invalid');
            categoryInput.classList.add('is-invalid');
            return false;
        }
    }

    async createCategory(): Promise<void> {
        const sendButton = this.sendButton;
        const categoryInput = this.categoryInput;

        if (!sendButton || !categoryInput) {
            return;
        }

        sendButton.disabled = true;
        sendButton.textContent = 'Создание...';

        try {
            const result = await HttpUtils.request(this.apiUrl, 'POST', true, {
                title: categoryInput.value.trim()
            });

            if (result.error || !result.response) {
                this.showError((result as any).message || 'Ошибка создания категории');
            } else {
                this.redirectBack();
            }
        } catch (error) {
            this.showError('Ошибка сети при создании категории');
        } finally {
            if (sendButton) {
                sendButton.disabled = false;
                sendButton.textContent = 'Сохранить';
            }
        }
    }

    async editCategory(): Promise<void> {
        const sendButton = this.sendButton;
        const categoryInput = this.categoryInput;

        if (!sendButton || !categoryInput || !this.currentCategoryId) {
            return;
        }

        sendButton.disabled = true;
        sendButton.textContent = 'Сохранение...';

        try {
            const result = await HttpUtils.request(`${this.apiUrl}/${this.currentCategoryId}`, 'PUT', true, {
                title: categoryInput.value.trim()
            });

            if (result.error || !result.response) {
                this.showError((result as any).message || 'Ошибка сохранения категории');
            } else {
                this.redirectBack();
            }
        } catch (error) {
            this.showError('Ошибка сети при сохранении категории');
        } finally {
            if (sendButton) {
                sendButton.disabled = false;
                sendButton.textContent = 'Сохранить';
            }
        }
    }

    showError(message: string): void {
        const errorElement = document.getElementById("input-name-category-error");
        if (errorElement) {
            errorElement.innerText = 'Ошибка: ' + message;
            errorElement.style.display = 'block';
        }

        const categoryInput = this.categoryInput;
        if (categoryInput) {
            categoryInput.classList.add('is-invalid');
        }
    }

    redirectBack(): void {
        const category = this.urlParams.get('category') as CategoryType | null;
        if (category === 'income') {
            this.openNewRoute('/profit');
        } else if (category === 'expense') {
            this.openNewRoute('/costs');
        } else {
            this.openNewRoute('/');
        }
    }

    cancel(): void {
        this.redirectBack();
    }
}