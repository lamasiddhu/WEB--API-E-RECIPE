// Per-tab auth storage. sessionStorage (unlike cookies) is isolated per
// browser tab, so logging into a different account in another tab no longer
// overwrites the session this tab is using.
const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export function setSession(token: string, user: unknown) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser<T = Record<string, unknown>>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function updateStoredUser(partial: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    const current = getStoredUser<Record<string, unknown>>() || {};
    const next = { ...current, ...partial };
    sessionStorage.setItem(USER_KEY, JSON.stringify(next));
    return next;
}

export function clearSession() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}
