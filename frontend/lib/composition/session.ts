import {
    ClearSessionUseCase,
    ReadSessionUseCase,
    SaveSessionUseCase,
    UpdateSessionUserUseCase,
} from "../application/useCases/session.useCases";
import { BrowserSessionAdapter } from "../infrastructure/storage/browserSession.adapter";

const adapter = new BrowserSessionAdapter();
const readSession = new ReadSessionUseCase(adapter);
const saveSession = new SaveSessionUseCase(adapter);
const updateSessionUser = new UpdateSessionUserUseCase(adapter);
const clearStoredSession = new ClearSessionUseCase(adapter);

export const getToken = () => readSession.execute<unknown>().token;
export const getStoredUser = <T>() => readSession.execute<T>().user;
export const setSession = (token: string, user: unknown) => saveSession.execute(token, user);
export const updateStoredUser = <T extends object>(partial: Partial<T>) => updateSessionUser.execute(partial);
export const clearSession = () => clearStoredSession.execute();
