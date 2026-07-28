import { KeyValueStoragePort } from "../../application/ports/keyValueStorage.port";

export class BrowserLocalStorageAdapter implements KeyValueStoragePort {
    get(key: string): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(key);
    }

    set(key: string, value: string): void {
        if (typeof window === "undefined") return;
        localStorage.setItem(key, value);
    }
}
