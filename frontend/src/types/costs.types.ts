export type CategoryExpense = {
    id: string | number;
    title: string;
};

export type AlertPopupHandlers = {
    yesHandler: () => void;
    noHandler: () => void;
};