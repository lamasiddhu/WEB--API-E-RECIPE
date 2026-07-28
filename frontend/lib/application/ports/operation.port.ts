export interface AsyncOperationPort<Arguments extends unknown[], Result> {
    execute(...args: Arguments): Promise<Result>;
}

export interface SyncOperationPort<Arguments extends unknown[], Result> {
    execute(...args: Arguments): Result;
}
