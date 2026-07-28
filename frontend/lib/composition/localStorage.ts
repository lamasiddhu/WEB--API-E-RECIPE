import { ReadStoredValueUseCase, WriteStoredValueUseCase } from "../application/useCases/keyValueStorage.useCases";
import { BrowserLocalStorageAdapter } from "../infrastructure/storage/browserLocalStorage.adapter";

const adapter = new BrowserLocalStorageAdapter();
const read = new ReadStoredValueUseCase(adapter);
const write = new WriteStoredValueUseCase(adapter);

export const readStoredValue = (key: string) => read.execute(key);
export const writeStoredValue = (key: string, value: string) => write.execute(key, value);
