export interface SessionPort {
    set(token: string, user: unknown): void;
    token(): string | null;
    user<T>(): T | null;
    updateUser<T extends object>(partial: Partial<T>): T | undefined;
    clear(): void;
}
