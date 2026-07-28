import { SessionPort } from "../../application/ports/session.port";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export class BrowserSessionAdapter implements SessionPort {
    set(token: string, user: unknown): void {
        if (typeof window === "undefined") return;
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    token(): string | null {
        if (typeof window === "undefined") return null;
        return sessionStorage.getItem(TOKEN_KEY);
    }

    user<T>(): T | null {
        if (typeof window === "undefined") return null;
        const raw = sessionStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    updateUser<T extends object>(partial: Partial<T>): T | undefined {
        if (typeof window === "undefined") return;
        const next = { ...(this.user<T>() || {} as T), ...partial };
        sessionStorage.setItem(USER_KEY, JSON.stringify(next));
        return next;
    }

    clear(): void {
        if (typeof window === "undefined") return;
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
    }
}
