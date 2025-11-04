import { OperationForTable } from "./operation.types";

export type TransactionType = 'income' | 'expense';

export type Category = {
    id: string | number;
    title: string;
};

export type EditTransactionRequest = {
    type: TransactionType;
    amount: number;
    date: string;
    comment: string;
    category_id: number;
};

export type Operation = OperationForTable;