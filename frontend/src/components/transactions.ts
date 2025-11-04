import { CardElement } from "./card-element";
import { LocalStorageUtils } from "../utils/localStorage-utils";
import { HttpUtils } from "../utils/http-utils";
import { Layout } from "./layout";
import { PeriodType, Operation } from "../types/transactions.types";

export class Transactions {
    private url: string = '/operations';
    private openNewRoute: (route: string) => void;
    private tableTbodyElement: HTMLElement | null;
    private buttonsBlockElement: NodeListOf<HTMLElement>;
    private alertPopupElement: HTMLElement | null;
    private buttonYesElement: HTMLElement | null;
    private buttonNoElement: HTMLElement | null;
    private buttonCreateIncome: HTMLElement | null;
    private buttonCreateExpense: HTMLElement | null;
    private buttonIntervalElement: HTMLElement | null;
    private buttonTodayElement: HTMLElement | null;
    private buttonWeekElement: HTMLElement | null;
    private buttonMonthElement: HTMLElement | null;
    private buttonYearElement: HTMLElement | null;
    private buttonAllElement: HTMLElement | null;

    constructor(openNewRoute: (route: string) => void) {
        this.openNewRoute = openNewRoute;

        this.tableTbodyElement = document.getElementById('table-tbody');
        this.buttonsBlockElement = document.querySelectorAll('.btn-outline-secondary');
        this.alertPopupElement = document.getElementById('alert-popup-block');
        this.buttonYesElement = document.getElementById('button-yes');
        this.buttonNoElement = document.getElementById('button-no');
        this.buttonCreateIncome = document.getElementById('create-income');
        this.buttonCreateExpense = document.getElementById('create-expense');
        this.buttonIntervalElement = document.getElementById('button-interval');
        this.buttonTodayElement = document.getElementById('button-today');
        this.buttonWeekElement = document.getElementById('button-week');
        this.buttonMonthElement = document.getElementById('button-month');
        this.buttonYearElement = document.getElementById('button-year');
        this.buttonAllElement = document.getElementById('button-all');

        if (!this.tableTbodyElement) {
            return;
        }

        this.buttonCreateIncome?.addEventListener('click', () => {
            sessionStorage.setItem('type', 'income');
        });

        this.buttonCreateExpense?.addEventListener('click', () => {
            sessionStorage.setItem('type', 'expense');
        });

        this.buttonsBlockElement.forEach(button => {
            button.addEventListener('click', () => {
                this.buttonsBlockElement.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        this.buttonTodayElement?.addEventListener('click', () => {
            this.setActiveButton(this.buttonTodayElement);
            this.getOperations('today').then();
        });

        this.buttonWeekElement?.addEventListener('click', () => {
            this.setActiveButton(this.buttonWeekElement);
            this.getOperations('week').then();
        });

        this.buttonMonthElement?.addEventListener('click', () => {
            this.setActiveButton(this.buttonMonthElement);
            this.getOperations('month').then();
        });

        this.buttonYearElement?.addEventListener('click', () => {
            this.setActiveButton(this.buttonYearElement);
            this.getOperations('year').then();
        });

        this.buttonAllElement?.addEventListener('click', () => {
            this.setActiveButton(this.buttonAllElement);
            this.getOperations('all').then();
        });

        this.buttonIntervalElement?.addEventListener('click', () => {
            this.setActiveButton(this.buttonIntervalElement);
            this.selectDateRange();
        });

        this.setActiveButton(this.buttonAllElement);
        this.getOperations('all').then();
    }

    setActiveButton(activeButton: HTMLElement | null): void {
        const buttons = document.querySelectorAll('.btn-outline-secondary');
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    selectDateRange(): void {
        const startDate = prompt("Выберите дату начала (YYYY-MM-DD):");
        if (!startDate) {
            return;
        }

        const endDate = prompt("Выберите дату окончания (YYYY-MM-DD):");
        if (!endDate) {
            return;
        }

        if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
            alert('Неверный формат даты! Используйте YYYY-MM-DD');
            return;
        }

        if (startDate > endDate) {
            alert('Дата начала не может быть позже даты окончания!');
            return;
        }

        const startDateLink = document.getElementById('link-interval-start');
        const endDateLink = document.getElementById('link-interval-end');

        if (startDateLink) startDateLink.textContent = startDate;
        if (endDateLink) endDateLink.textContent = endDate;

        this.getOperations('interval', startDate, endDate);
    }

    isValidDate(dateString: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;

        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    showIncomeExpense(operations: Operation[] | null = null): void {
        const tableTbodyElement = this.tableTbodyElement;
        if (!tableTbodyElement) {
            return;
        }

        tableTbodyElement.innerHTML = '';

        if (operations && operations.length > 0) {
            operations.forEach(operation => {
                const row = CardElement.createTable(operation);

                const trashIcon = row.querySelector('.trash');
                if (trashIcon) {
                    trashIcon.addEventListener('click', (event: Event) => {
                        event.stopPropagation();
                        this.showAlertPopup(operation);
                    });
                }

                const pencilIcon = row.querySelector('.pencil');
                if (pencilIcon) {
                    pencilIcon.addEventListener('click', (event: Event) => {
                        event.stopPropagation();
                        this.editOperation(operation);
                    });
                }

                tableTbodyElement.appendChild(row);
            });
        } else {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="7" class="text-center py-4 text-muted">
                    Нет операций для отображения
                </td>
            `;
            tableTbodyElement.appendChild(emptyRow);
        }
    }

    async editOperation(operation: Operation): Promise<void> {
        try {
            const existingOperation = await LocalStorageUtils.getOperation();
            if (existingOperation) {
                await LocalStorageUtils.removeOperation();
            }
            await LocalStorageUtils.setOperation(operation);
            this.openNewRoute('/edit-transaction');
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            await LocalStorageUtils.setOperation(operation);
            this.openNewRoute('/edit-transaction');
        }
    }

    async deleteOperation(operation: Operation): Promise<void> {
        const result = await HttpUtils.request(this.url + '/' + operation.id, 'DELETE');
        if (result.error) {
            alert('Ошибка при удалении операции: ' + (result as any).message);
            return;
        }

        const tableTbodyElement = this.tableTbodyElement;
        if (tableTbodyElement) {
            tableTbodyElement.innerHTML = '';
        }

        await this.getOperations('all');

        if (typeof Layout !== 'undefined' && Layout.setBalance) {
            await Layout.setBalance();
        }
    }

    showAlertPopup(operation: Operation | null = null): void {
        if (!this.alertPopupElement || !this.buttonYesElement || !this.buttonNoElement) {
            return;
        }

        this.alertPopupElement.style.display = 'flex';

        const yesHandler = (): void => {
            if (this.alertPopupElement) {
                this.alertPopupElement.style.display = 'none';
            }
            if (operation) {
                this.deleteOperation(operation);
            }
            this.buttonYesElement?.removeEventListener('click', yesHandler);
            this.buttonNoElement?.removeEventListener('click', noHandler);
        };

        const noHandler = (): void => {
            if (this.alertPopupElement) {
                this.alertPopupElement.style.display = 'none';
            }
            this.buttonYesElement?.removeEventListener('click', yesHandler);
            this.buttonNoElement?.removeEventListener('click', noHandler);
        };

        if (this.buttonYesElement && this.buttonNoElement) {
            this.buttonYesElement.onclick = yesHandler;
            this.buttonNoElement.onclick = noHandler;
        }
    }

    async getOperations(period: PeriodType = 'all', dateFrom: string | null = null, dateTo: string | null = null): Promise<void> {
        const queryParams = new URLSearchParams();

        if (period && period !== 'interval') {
            queryParams.append('period', period);
        }

        if (dateFrom) {
            queryParams.append('dateFrom', dateFrom);
        }
        if (dateTo) {
            queryParams.append('dateTo', dateTo);
        }

        const queryString = queryParams.toString();
        const url = queryString ? this.url + '?' + queryString : this.url;

        const result = await HttpUtils.request(url);

        if (result.error || !result.response) {
            alert('Ошибка при загрузке операций: ' + (result as any).message);
            return;
        }

        this.showIncomeExpense(result.response as Operation[]);
    }
}