export type TransactionType = 'income' | 'expense';

export type Category = {
    id: string | number;
    title: string;
};

export type CreateTransactionRequest = {
    type: TransactionType;
    amount: number;
    date: string;
    comment: string;
    category_id: number;
};