export type HttpRequestParams = {
    method: string;
    headers: Record<string, string>;
    body?: string;
};

export type HttpResponse<T = any> = {
    error: boolean;
    response: T | null;
    redirect?: string;
};

export type AuthTokens = {
    accessToken: string | null;
    refreshToken: string | null;
};