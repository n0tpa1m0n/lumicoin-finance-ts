import { config } from "./config";

interface TokensResponse {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    error?: boolean;
}

export interface UserInfo {
    id: string;
    name: string;
    lastName: string;
    email?: string;
}

export class AuthUtils {
    static accessTokenKey = "accessToken";
    static refreshTokenKey = "refreshToken";
    static userInfoTokenKey = "userInfoToken";

    static setAuthInfo(accessToken: string, refreshToken: string, userInfo: UserInfo): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
    }

    static removeAuthInfo(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    static getAuthInfo(key?: string): string | Record<string, string | null> | null {
        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)) {
            return localStorage.getItem(key);
        } else {
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
            };
        }
    }

    static async updateRefreshToken(): Promise<boolean> {
        let result = false;
        const refreshToken = this.getAuthInfo(this.refreshTokenKey) as string | null;

        if (refreshToken) {
            try {
                const response = await fetch(config.api + "/refresh", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                if (response.ok) {
                    const resultData = (await response.json()) as TokensResponse;

                    if (resultData && !resultData.error) {
                        const existingUserInfo = this.getUserInfo();
                        this.setAuthInfo(
                            resultData.tokens.accessToken,
                            resultData.tokens.refreshToken,
                            existingUserInfo || { id: '', name: '', lastName: '' }
                        );
                        result = true;
                    }
                }
            } catch (error) {
                console.error("Token refresh error:", error);
            }
        }

        if (!result) {
            this.removeAuthInfo();
        }

        return result;
    }

    static getUserInfo(): UserInfo | null {
        const userInfoStr = localStorage.getItem(this.userInfoTokenKey);
        if (userInfoStr) {
            try {
                return JSON.parse(userInfoStr) as UserInfo;
            } catch (e) {
                console.error('Error parsing user info:', e);
                return null;
            }
        }
        return null;
    }
}