export type CategoryType = 'income' | 'expense';
export type OperationType = 'create' | 'edit';

export type CategoryResponse = {
    title: string;
    id?: string | number;
};