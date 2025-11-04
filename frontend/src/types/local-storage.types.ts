import { OperationForTable } from './operation.types';

export type CategoryData = {
    id: string | number;
    [key: string]: unknown;
};

export type OperationData = OperationForTable;