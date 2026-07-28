import {
    AsyncOperationPort,
    SyncOperationPort,
} from "../../application/ports/operation.port";

export class AsyncFunctionAdapter<Arguments extends unknown[], Result>
implements AsyncOperationPort<Arguments, Result> {
    constructor(private readonly implementation: (...args: Arguments) => Promise<Result>) {}

    execute(...args: Arguments): Promise<Result> {
        return this.implementation(...args);
    }
}

export class SyncFunctionAdapter<Arguments extends unknown[], Result>
implements SyncOperationPort<Arguments, Result> {
    constructor(private readonly implementation: (...args: Arguments) => Result) {}

    execute(...args: Arguments): Result {
        return this.implementation(...args);
    }
}
