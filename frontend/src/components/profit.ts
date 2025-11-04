import { HttpUtils } from "../utils/http-utils";
import { CardElement } from "./card-element";
import { LocalStorageUtils as LocalStorageUtil } from "../utils/localStorage-utils";
import { CategoryIncome } from "../types/profit.types";

export class Profit {
    private url: string = '/categories/income';
    private pageTitle: string = "Доходы";
    private openNewRoute: (route: string) => void;
    private pageTitleElement: HTMLElement | null;
    private cardsElement: HTMLElement | null;
    private cardAddElement: HTMLElement | null = null;
    private alertPopupElement: HTMLElement | null = null;
    private buttonYesAlertPopupElement: HTMLElement | null = null;
    private buttonNoAlertPopupElement: HTMLElement | null = null;
    private currentDeleteElement: CategoryIncome | null = null;
    private incomes: CategoryIncome[] = [];

    constructor(openNewRoute: (route: string) => void) {
        this.openNewRoute = openNewRoute;
        this.pageTitleElement = document.getElementById('page-title');
        this.cardsElement = document.getElementById('cards');

        if (!this.pageTitleElement || !this.cardsElement) {
            return;
        }

        this.cardAddElement = document.createElement('div');
        this.cardAddElement.classList.add('col-xl-4', 'col-lg-4', 'col-md-6', 'col-sm-12', 'mb-4');
        this.cardAddElement.setAttribute('id', 'cardAdd');

        this.alertPopupElement = document.getElementById('alert-popup-block');
        this.buttonYesAlertPopupElement = document.getElementById('button-yes');
        this.buttonNoAlertPopupElement = document.getElementById('button-no');

        this.currentDeleteElement = null;

        this.showCategoriesIncome().then();
    }

    async showCategoriesIncome(): Promise<void> {
        if (this.pageTitleElement) {
            this.pageTitleElement.innerText = this.pageTitle;
        }

        if (this.cardsElement) {
            this.cardsElement.innerHTML = '';
        }

        this.incomes = await this.getCategoriesIncome();

        const cardsElement = this.cardsElement;

        if (this.incomes && this.incomes.length > 0 && cardsElement) {
            this.incomes.forEach(element => {
                const colElement = document.createElement('div');
                colElement.classList.add('col-xl-4', 'col-lg-4', 'col-md-6', 'col-sm-12', 'mb-4');

                const card = CardElement.cardElementForIncomeOrExpense(element.title);
                const cardTitle = card.querySelector('.card-text');

                if (cardTitle) {
                    cardTitle.innerHTML = element.title;
                }

                const buttonDelete = card.querySelector('.delete-button');
                if (buttonDelete) {
                    buttonDelete.addEventListener('click', (event: Event) => {
                        this.showAlertPopup(element);
                    });
                }

                const buttonEdit = card.querySelector('.edit-button');
                if (buttonEdit) {
                    buttonEdit.addEventListener('click', (event: Event) => {
                        this.editIncome(element);
                    });
                }

                colElement.appendChild(card);
                cardsElement.appendChild(colElement);
            });
        }

        this.addCreateCard();
    }

    addCreateCard(): void {
        if (this.cardAddElement && this.cardsElement) {
            this.cardAddElement.innerHTML = '<div class="card d-flex justify-content-center align-items-center p-0">'
                + '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">'
                + ' <path d="M14.5469 6.08984V9.05664H0.902344V6.08984H14.5469ZM9.32422 0.511719V15.0039H6.13867V0.511719H9.32422Z" fill="#CED4DA"/>'
                + ' </svg>'
                + ' </div>';
            this.cardsElement.appendChild(this.cardAddElement);

            const cardAdd = document.getElementById('cardAdd');
            if (cardAdd) {
                cardAdd.addEventListener('click', () => {
                    this.goCreateCategoryIncome();
                });
            }
        }
    }

    async getCategoriesIncome(): Promise<CategoryIncome[]> {
        const result = await HttpUtils.request(this.url);

        if (result.error || !result.response) {
            return [];
        }

        return result.response as CategoryIncome[];
    }

    showAlertPopup(element: CategoryIncome): void {
        if (!this.alertPopupElement || !this.buttonYesAlertPopupElement || !this.buttonNoAlertPopupElement) {
            return;
        }

        this.currentDeleteElement = element;
        this.alertPopupElement.style.display = 'flex';

        const yesHandler = (): void => {
            if (this.alertPopupElement) {
                this.alertPopupElement.style.display = 'none';
            }
            if (this.currentDeleteElement) {
                this.deleteCategoryIncome(this.currentDeleteElement);
            }
            this.buttonYesAlertPopupElement?.removeEventListener('click', yesHandler);
            this.buttonNoAlertPopupElement?.removeEventListener('click', noHandler);
        };

        const noHandler = (): void => {
            if (this.alertPopupElement) {
                this.alertPopupElement.style.display = 'none';
            }
            this.currentDeleteElement = null;
            this.buttonYesAlertPopupElement?.removeEventListener('click', yesHandler);
            this.buttonNoAlertPopupElement?.removeEventListener('click', noHandler);
        };

        if (this.buttonYesAlertPopupElement && this.buttonNoAlertPopupElement) {
            this.buttonYesAlertPopupElement.onclick = yesHandler;
            this.buttonNoAlertPopupElement.onclick = noHandler;
        }
    }

    async deleteCategoryIncome(element: CategoryIncome): Promise<void> {
        const result = await HttpUtils.request((this.url + '/' + element.id), 'DELETE');
        if (!result.error) {
            this.openNewRoute('/profit');
        } else {
            alert('Ошибка при удалении категории: ' + (result as any).message);
        }
    }

    async editIncome(element: CategoryIncome): Promise<void> {
        try {
            const existingCategory = await LocalStorageUtil.getCategory();
            if (existingCategory) {
                await LocalStorageUtil.removeCategory();
            }
            await LocalStorageUtil.setCategory(element);
            this.openNewRoute(`/categories?type=edit&category=income&id=${element.id}`);
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            await LocalStorageUtil.setCategory(element);
            this.openNewRoute(`/categories?type=edit&category=income&id=${element.id}`);
        }
    }

    goCreateCategoryIncome(): void {
        this.openNewRoute('/categories?type=create&category=income');
    }
}