import { UserInfo } from "../utils/auth-utils";

export type LoginRequest = {
    email: string;
    password: string;
    rememberMe: boolean;
};

export type LoginResponse = {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    user: UserInfo;
};