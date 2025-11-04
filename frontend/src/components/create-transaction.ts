import { HttpUtils } from "../utils/http-utils";
import { Layout } from "./layout";
import { TransactionType, Category, CreateTransactionRequest } from "../types/create-transaction.types";

export class CreateTransaction {
    private urlCreate: string = '/operations';
    private urlIncome: string = '/categories/income';
    private urlExpense: string = '/categories/expense';
    private pageTitle: string = "Создание дохода/расхода";

    private openNewRoute: (route: string) => void;
    private pageTitleElement: HTMLElement | null;
    private typeSelectElement: HTMLSelectElement | null;
    private categorySelectElement: HTMLSelectElement | null;
    private amountInputElement: HTMLInputElement | null;
    private dateInputElement: HTMLInputElement | null;
    private commentInputElement: HTMLInputElement | null;
    private buttonCreateElement: HTMLButtonElement | null;
    private selectIncomeElement: HTMLOptionElement | null;
    private selectExpenseElement: HTMLOptionElement | null;
    private typeOperation: TransactionType | null = null;
    private categoryList: Category[] = [];

    constructor(openNewRoute: (route: string) => void) {
        this.openNewRoute = openNewRoute;

        this.pageTitleElement = document.getElementById('page-title');
        this.typeSelectElement = document.getElementById('type') as HTMLSelectElement | null;
        this.categorySelectElement = document.getElementById('type-category') as HTMLSelectElement | null;
        this.amountInputElement = document.getElementById('amount') as HTMLInputElement | null;
        this.dateInputElement = document.getElementById('date') as HTMLInputElement | null;
        this.commentInputElement = document.getElementById('comment') as HTMLInputElement | null;
        this.buttonCreateElement = document.getElementById('button-create') as HTMLButtonElement | null;
        this.selectIncomeElement = document.getElementById('select-inc') as HTMLOptionElement | null;
        this.selectExpenseElement = document.getElementById('select-exp') as HTMLOptionElement | null;

        const pageTitleElement = this.pageTitleElement;
        const typeSelectElement = this.typeSelectElement;
        const buttonCreateElement = this.buttonCreateElement;

        if (pageTitleElement) {
            pageTitleElement.innerText = this.pageTitle;
        }

        if (buttonCreateElement) {
            buttonCreateElement.addEventListener('click', this.setIncomeExpense.bind(this));
        }

        if (typeSelectElement) {
            typeSelectElement.addEventListener('change', () => {
                this.updateCategories();
            });
        }

        this.typeOperation = sessionStorage.getItem('type') as TransactionType | null;

        if (typeSelectElement && this.typeOperation) {
            typeSelectElement.value = this.typeOperation;
        }

        if (this.typeOperation === 'expense') {
            if (this.selectExpenseElement) this.selectExpenseElement.selected = true;
            if (this.selectIncomeElement) this.selectIncomeElement.selected = false;
        } else {
            if (this.selectIncomeElement) this.selectIncomeElement.selected = true;
            if (this.selectExpenseElement) this.selectExpenseElement.selected = false;
        }

        this.showCategory().then();
    }

    async showCategory(): Promise<void> {
        const categorySelectElement = this.categorySelectElement;
        if (!categorySelectElement) {
            return;
        }

        categorySelectElement.innerHTML = '<option value="" selected disabled>Категория</option>';

        this.categoryList = await this.getCategory();

        if (this.categoryList && this.categoryList.length > 0) {
            this.categoryList.forEach(category => {
                const optionElement = document.createElement('option');
                optionElement.setAttribute('value', category.id.toString());
                optionElement.innerText = category.title;
                categorySelectElement.appendChild(optionElement);
            });
        } else {
            const noCategoryOption = document.createElement('option');
            noCategoryOption.disabled = true;
            noCategoryOption.innerText = 'Нет доступных категорий';
            categorySelectElement.appendChild(noCategoryOption);
        }
    }

    async updateCategories(): Promise<void> {
        const typeSelectElement = this.typeSelectElement;
        if (typeSelectElement) {
            this.typeOperation = typeSelectElement.value as TransactionType;
        }
        await this.showCategory();
    }

    validateForm(): boolean {
        const typeSelectElement = this.typeSelectElement;
        const categorySelectElement = this.categorySelectElement;
        const amountInputElement = this.amountInputElement;
        const dateInputElement = this.dateInputElement;
        const commentInputElement = this.commentInputElement;

        let isValid = true;

        if (typeSelectElement && typeSelectElement.value) {
            typeSelectElement.classList.remove('is-invalid');
        } else {
            if (typeSelectElement) typeSelectElement.classList.add('is-invalid');
            isValid = false;
        }

        if (categorySelectElement && categorySelectElement.value && categorySelectElement.value !== '') {
            categorySelectElement.classList.remove('is-invalid');
        } else {
            if (categorySelectElement) categorySelectElement.classList.add('is-invalid');
            isValid = false;
        }

        if (amountInputElement && amountInputElement.value && parseFloat(amountInputElement.value) > 0) {
            amountInputElement.classList.remove('is-invalid');
        } else {
            if (amountInputElement) amountInputElement.classList.add('is-invalid');
            isValid = false;
        }

        if (dateInputElement && dateInputElement.value) {
            dateInputElement.classList.remove('is-invalid');
        } else {
            if (dateInputElement) dateInputElement.classList.add('is-invalid');
            isValid = false;
        }

        if (commentInputElement && commentInputElement.value.trim()) {
            commentInputElement.classList.remove('is-invalid');
        } else {
            if (commentInputElement) commentInputElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    async setIncomeExpense(): Promise<void> {
        const typeSelectElement = this.typeSelectElement;
        const categorySelectElement = this.categorySelectElement;
        const amountInputElement = this.amountInputElement;
        const dateInputElement = this.dateInputElement;
        const commentInputElement = this.commentInputElement;
        const buttonCreateElement = this.buttonCreateElement;

        if (!typeSelectElement || !categorySelectElement || !amountInputElement ||
            !dateInputElement || !commentInputElement || !buttonCreateElement) {
            return;
        }

        if (this.validateForm()) {
            const requestData: CreateTransactionRequest = {
                type: typeSelectElement.value as TransactionType,
                amount: parseFloat(amountInputElement.value),
                date: dateInputElement.value,
                comment: commentInputElement.value,
                category_id: parseInt(categorySelectElement.value)
            };

            buttonCreateElement.disabled = true;
            buttonCreateElement.textContent = 'Создание...';

            try {
                const result = await HttpUtils.request(this.urlCreate, 'POST', true, requestData);

                if (result.error || !result.response) {
                    const errorMessage = (result as any).message || 'Неизвестная ошибка';
                    alert('Ошибка при создании операции: ' + errorMessage);

                    const inputErrorElement = document.getElementById("input-name-category-error");
                    if (inputErrorElement) {
                        inputErrorElement.innerText = 'Ошибка: ' + errorMessage;
                        inputErrorElement.style.display = 'block';
                    }
                } else {
                    sessionStorage.removeItem('type');
                    if (typeof Layout !== 'undefined' && Layout.setBalance) {
                        await Layout.setBalance();
                    }
                    this.openNewRoute('/transactions');
                }
            } catch (error) {
                alert('Ошибка сети при создании операции');
            } finally {
                buttonCreateElement.disabled = false;
                buttonCreateElement.textContent = 'Создать';
            }
        } else {
            console.log('Form validation failed');
        }
    }

    async getCategory(): Promise<Category[]> {
        let url = this.urlIncome;
        if (this.typeOperation === 'expense') {
            url = this.urlExpense;
        }

        const result = await HttpUtils.request(url);

        if (result.error || !result.response) {
            return [];
        }

        return result.response as Category[];
    }
}