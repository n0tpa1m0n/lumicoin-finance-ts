export type OperationType = 'income' | 'expense';
export type OperationForTable = {
    id: string | number;
    type: OperationType;
    category: string;
    amount: number;
    date: string;
    comment: string;
};


export type OperationForApi = OperationForTable & {
    user_id: number;
    category_expense_id?: number | null;
    category_income_id?: number | null;
};

export type PeriodType = 'today' | 'week' | 'month' | 'year' | 'all' | 'interval';