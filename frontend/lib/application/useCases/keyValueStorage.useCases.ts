import { KeyValueStoragePort } from "../ports/keyValueStorage.port";

export class ReadStoredValueUseCase {
    constructor(private readonly storage: KeyValueStoragePort) {}
    execute(key: string) { return this.storage.get(key); }
}

export class WriteStoredValueUseCase {
    constructor(private readonly storage: KeyValueStoragePort) {}
    execute(key: string, value: string) { this.storage.set(key, value); }
}
