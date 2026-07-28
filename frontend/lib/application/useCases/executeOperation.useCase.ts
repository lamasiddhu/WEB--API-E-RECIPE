import {
    AsyncOperationPort,
    SyncOperationPort,
} from "../ports/operation.port";

export class ExecuteAsyncOperationUseCase<Arguments extends unknown[], Result> {
    constructor(private readonly operation: AsyncOperationPort<Arguments, Result>) {}

    execute(...args: Arguments): Promise<Result> {
        return this.operation.execute(...args);
    }
}

export class ExecuteSyncOperationUseCase<Arguments extends unknown[], Result> {
    constructor(private readonly operation: SyncOperationPort<Arguments, Result>) {}

    execute(...args: Arguments): Result {
        return this.operation.execute(...args);
    }
}
