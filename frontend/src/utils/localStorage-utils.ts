import { CategoryData, OperationData } from "../types/local-storage.types";

export class LocalStorageUtils {
    static CategoryKey: string = 'category';
    static OperationKey: string = 'operation';

    static async setCategory(value: CategoryData): Promise<void> {
        localStorage.setItem(this.CategoryKey, JSON.stringify(value));
    }

    static async getCategory(): Promise<CategoryData | null> {
        const item = localStorage.getItem(this.CategoryKey);
        return item ? JSON.parse(item) as CategoryData : null;
    }

    static async removeCategory(): Promise<void> {
        localStorage.removeItem(this.CategoryKey);
    }

    static setOperation(value: OperationData): void {
        localStorage.setItem(this.OperationKey, JSON.stringify(value));
    }

    static getOperation(): OperationData | null {
        const item = localStorage.getItem(this.OperationKey);
        return item ? JSON.parse(item) as OperationData : null;
    }

    static removeOperation(): void {
        localStorage.removeItem(this.OperationKey);
    }
}