export type OperationForTable = {
    id: string | number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    comment: string;
    user_id?: number;
    category_expense_id?: number | null;
    category_income_id?: number | null;
};