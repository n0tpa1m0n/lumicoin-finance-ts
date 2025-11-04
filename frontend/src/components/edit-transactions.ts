import { LocalStorageUtils } from "../utils/localStorage-utils";
import { HttpUtils } from "../utils/http-utils";
import { TransactionType, Category, EditTransactionRequest, Operation } from "../types/edit-transactions.types";

export class EditTransactions {
    private urlEdit: string = '/operations';
    private urlIncome: string = '/categories/income';
    private urlExpense: string = '/categories/expense';
    private pageTitle: string = "Редактирование дохода/расхода";

    private openNewRoute: (route: string) => void;
    private editOperation: Operation | null = null;
    private pageTitleElement: HTMLElement | null;
    private typeSelectElement: HTMLSelectElement | null;
    private categorySelectElement: HTMLSelectElement | null;
    private amountInputElement: HTMLInputElement | null;
    private dateInputElement: HTMLInputElement | null;
    private commentInputElement: HTMLInputElement | null;
    private buttonCreateElement: HTMLButtonElement | null;
    private selectCategoryTitle: HTMLElement | null;
    private selectIncomeElement: HTMLOptionElement | null;
    private selectExpenseElement: HTMLOptionElement | null;
    private typeOperation: TransactionType | null = null;

    constructor(openNewRoute: (route: string) => void) {
        this.openNewRoute = openNewRoute;

        this.pageTitleElement = document.getElementById('page-title');
        this.typeSelectElement = document.getElementById('type') as HTMLSelectElement | null;
        this.categorySelectElement = document.getElementById('type-category') as HTMLSelectElement | null;
        this.amountInputElement = document.getElementById('amount') as HTMLInputElement | null;
        this.dateInputElement = document.getElementById('date') as HTMLInputElement | null;
        this.commentInputElement = document.getElementById('comment') as HTMLInputElement | null;
        this.buttonCreateElement = document.getElementById('button-create') as HTMLButtonElement | null;
        this.selectCategoryTitle = document.getElementById('title-category');
        this.selectIncomeElement = document.getElementById('select-inc') as HTMLOptionElement | null;
        this.selectExpenseElement = document.getElementById('select-exp') as HTMLOptionElement | null;

        this.init().then();
    }

    async init(): Promise<void> {
        try {
            this.editOperation = await LocalStorageUtils.getOperation();
            console.log(this.editOperation);

            if (!this.editOperation) {
                console.error('No operation data found in localStorage');
                return;
            }

            const pageTitleElement = this.pageTitleElement;
            const typeSelectElement = this.typeSelectElement;
            const buttonCreateElement = this.buttonCreateElement;
            const selectCategoryTitle = this.selectCategoryTitle;

            if (pageTitleElement) {
                pageTitleElement.innerText = this.pageTitle;
            }

            if (typeSelectElement && this.editOperation.type) {
                typeSelectElement.value = this.editOperation.type;
            }

            if (typeSelectElement) {
                typeSelectElement.addEventListener('change', (event: Event) => {
                    const target = event.target as HTMLSelectElement;
                    this.typeOperation = target.value as TransactionType;
                    this.getCategory().then();
                });
            }

            if (buttonCreateElement) {
                buttonCreateElement.innerText = 'Сохранить';
                buttonCreateElement.addEventListener('click', this.editIncomeExpense.bind(this));
            }

            if (selectCategoryTitle) {
                selectCategoryTitle.removeAttribute('selected');
            }

            this.typeOperation = this.editOperation.type as TransactionType;

            if (typeSelectElement) {
                typeSelectElement.addEventListener('change', (e: Event) => {
                    const target = e.target as HTMLSelectElement;
                    console.log(target.value);

                    if (this.typeOperation === 'income') {
                        if (this.selectExpenseElement) this.selectExpenseElement.removeAttribute('selected');
                        if (this.selectIncomeElement) this.selectIncomeElement.setAttribute('selected', 'selected');
                    } else {
                        if (this.selectIncomeElement) this.selectIncomeElement.removeAttribute('selected');
                        if (this.selectExpenseElement) this.selectExpenseElement.setAttribute('selected', 'selected');
                    }
                });
            }

            await this.getCategory();
        } catch (error) {
            console.error('Error initializing EditTransactions:', error);
        }
    }

    showCategory(categories: Category[]): void {
        const categorySelectElement = this.categorySelectElement;
        const amountInputElement = this.amountInputElement;
        const dateInputElement = this.dateInputElement;
        const commentInputElement = this.commentInputElement;

        if (!categorySelectElement || !this.editOperation) {
            return;
        }

        categorySelectElement.innerHTML = '';

        if (categories && categories.length > 0) {
            categories.forEach(category => {
                const optionElement = document.createElement('option');
                if (category.title === this.editOperation!.category) {
                    optionElement.setAttribute('selected', 'selected');
                }
                optionElement.setAttribute('value', category.id.toString());
                optionElement.innerText = category.title;

                categorySelectElement.appendChild(optionElement);
            });

            if (amountInputElement && this.editOperation.amount) {
                amountInputElement.value = this.editOperation.amount.toString();
            }
            if (dateInputElement && this.editOperation.date) {
                dateInputElement.value = this.editOperation.date;
            }
            if (commentInputElement && this.editOperation.comment) {
                commentInputElement.value = this.editOperation.comment;
            }
        }
    }

    async editIncomeExpense(): Promise<void> {
        const typeSelectElement = this.typeSelectElement;
        const categorySelectElement = this.categorySelectElement;
        const amountInputElement = this.amountInputElement;
        const dateInputElement = this.dateInputElement;
        const commentInputElement = this.commentInputElement;

        if (!this.editOperation || !typeSelectElement || !categorySelectElement ||
            !amountInputElement || !dateInputElement || !commentInputElement) {
            return;
        }

        if (this.validateForm()) {
            const requestData: EditTransactionRequest = {
                type: typeSelectElement.value as TransactionType,
                amount: parseFloat(amountInputElement.value),
                date: dateInputElement.value,
                comment: commentInputElement.value,
                category_id: parseInt(categorySelectElement.value)
            };

            try {
                const result = await HttpUtils.request(this.urlEdit + '/' + this.editOperation.id, 'PUT', true, requestData);

                if (result && !result.error) {
                    LocalStorageUtils.removeOperation(); // Очищаем localStorage после успешного редактирования
                    this.openNewRoute('/transactions');
                } else {
                    alert('Ошибка при сохранении операции: ' + (result as any).message);
                }
            } catch (error) {
                console.error('Error editing transaction:', error);
                alert('Ошибка сети при сохранении операции');
            }
        }
    }

    validateForm(): boolean {
        const categorySelectElement = this.categorySelectElement;
        const amountInputElement = this.amountInputElement;
        const dateInputElement = this.dateInputElement;
        const commentInputElement = this.commentInputElement;

        let isValid = true;

        if (categorySelectElement && categorySelectElement.value && categorySelectElement.value !== 'Категория') {
            categorySelectElement.classList.remove('is-invalid');
        } else {
            if (categorySelectElement) categorySelectElement.classList.add('is-invalid');
            isValid = false;
        }

        if (amountInputElement && amountInputElement.value.trim()) {
            amountInputElement.classList.remove('is-invalid');
        } else {
            if (amountInputElement) amountInputElement.classList.add('is-invalid');
            isValid = false;
        }

        if (dateInputElement && dateInputElement.value.trim()) {
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

    async getCategory(): Promise<void> {
        let url = this.urlExpense;
        if (this.typeOperation === 'income') {
            url = this.urlIncome;
        }

        const result = await HttpUtils.request(url);

        if (result.error || !result.response) {
            console.log((result as any).message);
            return;
        }

        this.showCategory(result.response as Category[]);
    }
}