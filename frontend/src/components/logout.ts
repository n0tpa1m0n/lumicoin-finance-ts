import { AuthUtils } from "../utils/auth-utils";
import { HttpUtils } from "../utils/http-utils";

export class Logout {
    private openNewRoute: (route: string) => void;

    constructor(openNewRoute: (route: string) => void) {
        this.openNewRoute = openNewRoute;

        const accessToken = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
        const refreshToken = AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey);

        if (!accessToken || !refreshToken) {
            this.openNewRoute('/login');
            return;
        }

        this.logout().then();
    }

    async logout(): Promise<void> {
        try {
            const refreshToken = AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey);

            if (refreshToken && typeof refreshToken === 'string') {
                await HttpUtils.request('/logout', 'POST', false, {
                    refreshToken: refreshToken
                });
            }

            AuthUtils.removeAuthInfo();

            this.openNewRoute('/login');

        } catch (error) {
            console.error('Logout error:', error);

            AuthUtils.removeAuthInfo();
            this.openNewRoute('/login');
        }
    }
}