import { Chart, registerables } from 'chart.js';
import { HttpUtils } from "../utils/http-utils";
import { Layout } from "./layout";

Chart.register(...registerables);

export class Dashboard {
    private openNewRoute: (url: string) => Promise<void>;
    private url: string = '/operations';
    private balanceUrl: string = '/balance';

    private chartIncome: Chart | null = null;
    private chartExpenses: Chart | null = null;

    private canvasIncomeElement: HTMLCanvasElement | null = null;
    private canvasExpensesElement: HTMLCanvasElement | null = null;

    private canvasIncome: CanvasRenderingContext2D | null = null;
    private canvasExpenses: CanvasRenderingContext2D | null = null;

    private startDate: string | null = null;
    private endDate: string | null = null;

    private colors: string[] = [
        "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#F0FF33",
        "#33FFF5", "#FF8C33", "#B833FF", "#581845", "#338CFF",
        "#FFC300", "#DAF7A6", "#C70039", "#900C3F", "#FFC0CB",
        "#A52A2A", "#D2691E", "#20B2AA", "#FF4500", "#2E8B57",
        "#6A5ACD", "#FFD700", "#ADFF2F", "#FF6347", "#00FA9A",
        "#7B68EE", "#DDA0DD", "#F08080", "#33FF8C",
    ];

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;

        const canvasIncomeElement = document.getElementById('canvas-inc') as HTMLCanvasElement | null;
        const canvasExpensesElement = document.getElementById('canvas-exp') as HTMLCanvasElement | null;

        if (!canvasIncomeElement || !canvasExpensesElement) {
            console.warn('Dashboard: canvas elements not found');
            return;
        }

        this.canvasIncomeElement = canvasIncomeElement;
        this.canvasExpensesElement = canvasExpensesElement;

        this.canvasIncome = canvasIncomeElement.getContext('2d');
        this.canvasExpenses = canvasExpensesElement.getContext('2d');

        this.initEventListeners();
        this.getOperations('all').then();
        this.updateBalance();
    }

    private initEventListeners(): void {
        const todayBtn = document.getElementById('button-today');
        const weekBtn = document.getElementById('button-week');
        const monthBtn = document.getElementById('button-month');
        const yearBtn = document.getElementById('button-year');
        const allBtn = document.getElementById('button-all');
        const intervalBtn = document.getElementById('button-interval');
        const startDateLink = document.getElementById('startDateLink');
        const endDateLink = document.getElementById('endDateLink');
        const detailsBtn = document.getElementById('button-details');

        const bindPeriodButton = (btn: HTMLElement | null, period: string) => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                this.setActiveButton(btn);
                this.getOperations(period);
            });
        };

        bindPeriodButton(todayBtn, 'today');
        bindPeriodButton(weekBtn, 'week');
        bindPeriodButton(monthBtn, 'month');
        bindPeriodButton(yearBtn, 'year');
        bindPeriodButton(allBtn, 'all');

        if (intervalBtn) {
            intervalBtn.addEventListener('click', () => {
                this.setActiveButton(intervalBtn);
                this.selectDateRange();
            });
        }

        if (startDateLink) {
            startDateLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectStartDate();
            });
        }

        if (endDateLink) {
            endDateLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectEndDate();
            });
        }

        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => {
                this.openNewRoute('/costs');
            });
        }

        this.setActiveButton(allBtn);
    }

    private async updateBalance(): Promise<void> {
        try {
            const result = await HttpUtils.request(this.balanceUrl);

            if (result.error) return;

            if (result.response?.balance !== undefined) {
                const balanceElement = document.getElementById('balance-amount');
                if (balanceElement) {
                    balanceElement.textContent = `${result.response.balance}$`;
                }
            }
        } catch (error) {
            console.error('Balance update error:', error);
        }
    }

    private setActiveButton(activeButton: HTMLElement | null): void {
        const buttons = document.querySelectorAll('.btn-outline-secondary');
        buttons.forEach(btn => btn.classList.remove('active'));
        if (activeButton) activeButton.classList.add('active');
    }

    private selectDateRange(): void {
        const startDate = prompt("Выберите дату начала (YYYY-MM-DD):");
        if (!startDate) return;

        const endDate = prompt("Выберите дату окончания (YYYY-MM-DD):");
        if (!endDate) return;

        const startDateLink = document.getElementById('startDateLink');
        const endDateLink = document.getElementById('endDateLink');

        if (startDateLink) startDateLink.textContent = startDate;
        if (endDateLink) endDateLink.textContent = endDate;

        this.startDate = startDate;
        this.endDate = endDate;

        this.getOperations('interval', startDate, endDate);
    }

    private selectStartDate(): void {
        const selectedDate = prompt("Выберите дату начала (YYYY-MM-DD):");
        if (selectedDate) {
            const link = document.getElementById('startDateLink');
            if (link) link.textContent = selectedDate;
            this.startDate = selectedDate;
        }
    }

    private selectEndDate(): void {
        const selectedDate = prompt("Выберите дату окончания (YYYY-MM-DD):");
        if (selectedDate) {
            const link = document.getElementById('endDateLink');
            if (link) link.textContent = selectedDate;
            this.endDate = selectedDate;
        }
    }

    private isValidDate(dateString: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    private createData(operations: any[] | null): void {
        if (!operations || operations.length === 0) {
            this.showEmptyCharts();
            return;
        }

        const expenses = operations.filter(item => item.type === 'expense');
        const incomes = operations.filter(item => item.type === 'income');

        const aggregatedExpenses = this.aggregateByCategory(expenses);
        const aggregatedIncomes = this.aggregateByCategory(incomes);

        this.updateCharts(aggregatedIncomes, aggregatedExpenses);
    }

    private showEmptyCharts(): void {
        this.destroyCharts();

        const emptyData = {
            labels: ['Нет данных'],
            datasets: [{
                data: [1],
                backgroundColor: ['#e9ecef'],
                borderColor: ['#dee2e6'],
                borderWidth: 1
            }]
        };

        const emptyConfig = this.getConfig(emptyData, 'Нет данных');
        emptyConfig.options.plugins.tooltip = {
            callbacks: {
                label: () => 'Нет данных для отображения'
            }
        };

        if (this.isCanvasAvailable(this.canvasIncomeElement))
            this.chartIncome = new Chart(this.canvasIncome!, emptyConfig);

        if (this.isCanvasAvailable(this.canvasExpensesElement))
            this.chartExpenses = new Chart(this.canvasExpenses!, emptyConfig);
    }

    private isCanvasAvailable(canvasElement: HTMLCanvasElement | null): boolean {
        if (!canvasElement) return false;
        const existingChart = Chart.getChart(canvasElement);
        if (existingChart) existingChart.destroy();
        return true;
    }

    private destroyCharts(): void {
        [this.canvasIncomeElement, this.canvasExpensesElement].forEach(el => {
            if (el) {
                const chart = Chart.getChart(el);
                if (chart) chart.destroy();
            }
        });

        this.chartIncome?.destroy();
        this.chartExpenses?.destroy();
        this.chartIncome = null;
        this.chartExpenses = null;
    }

    private aggregateByCategory(items: any[]): Record<string, { category: string, total: number }> {
        return items.reduce((acc, cur) => {
            const category = cur.category;
            const amount = cur.amount;
            if (!acc[category]) acc[category] = { category, total: 0 };
            acc[category].total += amount;
            return acc;
        }, {} as Record<string, { category: string, total: number }>);
    }

    private updateCharts(incomes: Record<string, any>, expenses: Record<string, any>): void {
        this.destroyCharts();

        const incomeLabels = Object.keys(incomes);
        const expenseLabels = Object.keys(expenses);

        const incomeData = {
            labels: incomeLabels,
            datasets: [{
                data: Object.values(incomes).map(i => i.total),
                backgroundColor: this.colors.slice(0, incomeLabels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        const expenseData = {
            labels: expenseLabels,
            datasets: [{
                data: Object.values(expenses).map(i => i.total),
                backgroundColor: this.colors.slice(0, expenseLabels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        if (incomeLabels.length && this.isCanvasAvailable(this.canvasIncomeElement))
            this.chartIncome = new Chart(this.canvasIncome!, this.getConfig(incomeData, 'Доходы'));
        else if (this.isCanvasAvailable(this.canvasIncomeElement))
            this.showEmptyChart(this.canvasIncome!, 'Доходы');

        if (expenseLabels.length && this.isCanvasAvailable(this.canvasExpensesElement))
            this.chartExpenses = new Chart(this.canvasExpenses!, this.getConfig(expenseData, 'Расходы'));
        else if (this.isCanvasAvailable(this.canvasExpensesElement))
            this.showEmptyChart(this.canvasExpenses!, 'Расходы');
    }

    private showEmptyChart(ctx: CanvasRenderingContext2D, title: string): Chart {
        const emptyData = {
            labels: ['Нет данных'],
            datasets: [{ data: [1], backgroundColor: ['#e9ecef'] }]
        };

        const config = this.getConfig(emptyData, title);
        config.options.plugins.tooltip = {
            callbacks: {
                label: () => `Нет данных по ${title.toLowerCase()}`
            }
        };

        return new Chart(ctx, config);
    }

    private async getOperations(period: string = 'all', dateFrom: string | null = null, dateTo: string | null = null): Promise<any[]> {
        const queryParams = new URLSearchParams();

        if (period && period !== 'interval') queryParams.append('period', period);
        if (period === 'interval' && dateFrom && dateTo) {
            queryParams.append('dateFrom', dateFrom);
            queryParams.append('dateTo', dateTo);
        }

        const queryString = queryParams.toString();
        const url = queryString ? `${this.url}?${queryString}` : this.url;

        const result = await HttpUtils.request(url);

        if (result.error) {
            this.showEmptyCharts();
            return [];
        }

        this.createData(result.response);
        this.updateBalance();

        return result.response;
    }

    private getConfig(data: any, title: string = ''): any {
        return {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context: any) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value}$ (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
    }

    public static async updateDiag(period: string = '', dateFrom: string | null = null, dateTo: string | null = null): Promise<void> {
        const dashboardInstance = new Dashboard(async () => {});
        await dashboardInstance.getOperations(period, dateFrom, dateTo);
    }

    public destroy(): void {
        this.destroyCharts();
    }
}
