export type RegisterRequest = {
    name: string;
    lastName: string;
    email: string;
    password: string;
    passwordRepeat: string;
};

export type RegisterResponse = {
    user?: {
        id: string | number;
        name?: string;
        lastName?: string;
        email?: string;
    };
    validation?: Array<{
        field: string;
        message: string;
    }>;
    error?: boolean;
};

export type ValidationError = {
    field: string;
    message: string;
};