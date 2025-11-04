import {HttpUtils} from "../utils/http-utils";

export class CreateOperation {
    urlCreate = '/operations';
    urlIncome = '/categories/income';
    urlExpense = '/categories/expense';

    pageTitle = "Создание дохода/расхода"

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.pageTitleElement = document.getElementById('page-title');
        this.pageTitleElement.innerText = this.pageTitle;
        this.typeSelectElement = document.getElementById('type');
        this.categorySelectElement = document.getElementById('type-category');
        this.amountInputElement = document.getElementById('amount');
        this.dateInputElement = document.getElementById('date');
        this.commentInputElement = document.getElementById('comment');
        this.buttonCreateElement = document.getElementById('button-create');
        this.buttonCreateElement.addEventListener('click', this.setIncomeExpense.bind(this));
        this.selectIncomeElement = document.getElementById('select-inc');
        this.selectExpenseElement = document.getElementById('select-exp');
        this.typeOperation = sessionStorage.getItem('type');
        if (this.typeOperation === 'expense') {
            this.selectExpenseElement.removeAttribute('selected');
            this.selectIncomeElement.setAttribute('selected', 'selected');
        } else {
            this.selectIncomeElement.removeAttribute('selected');
            this.selectExpenseElement.setAttribute('selected', 'selected');
        }

        this.showCategory().then();
    }

    async showCategory() {
        this.categoryList = await this.getCategory();
        if (this.categoryList) {
            this.categoryList.forEach(category => {
                const optionElement = document.createElement('option');
                optionElement.setAttribute('value', category.id);
                optionElement.innerText = category.title;
                this.categorySelectElement.appendChild(optionElement);
            })
        }
    }

    validateForm() {
        let isValid = true;

        if (this.typeSelectElement.value.trim() === this.typeOperation) {
            this.typeSelectElement.classList.remove('is-invalid');
        } else {
            this.typeSelectElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.categorySelectElement.value.trim() !== 'Категория') {
            this.categorySelectElement.classList.remove('is-invalid');
        } else {
            this.categorySelectElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.amountInputElement.value.trim()) {
            this.amountInputElement.classList.remove('is-invalid');
        } else {
            this.amountInputElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.dateInputElement.value.trim()) {
            this.dateInputElement.classList.remove('is-invalid');
        } else {
            this.dateInputElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.commentInputElement.value.trim()) {
            this.commentInputElement.classList.remove('is-invalid');
        } else {
            this.commentInputElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    async setIncomeExpense() {
        console.log(parseInt(this.categorySelectElement.value));
        if (this.validateForm()) {
            const result = await HttpUtils.request(this.urlCreate, 'POST', true, {
                id: parseInt((this.categorySelectElement.value).id),
                type: this.typeSelectElement.value,
                amount: parseInt(this.amountInputElement.value),
                date: this.dateInputElement.value,
                comment: this.commentInputElement.value,
                category: this.categorySelectElement.value,
            })
            this.openNewRoute('/transaction');
        }
    }

    async getCategory() {
        let url = this.urlExpense;
        if (this.typeOperation === 'expense') {
            url = this.urlExpense;
        }
        sessionStorage.removeItem('type');

        const result = await HttpUtils.request(url);

        if (result.error) {
            console.log(result.message)
            return [];
        }

        return result.response;
    }
}