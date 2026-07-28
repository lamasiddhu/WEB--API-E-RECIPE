import { SessionPort } from "../ports/session.port";

export class ReadSessionUseCase {
    constructor(private readonly session: SessionPort) {}
    execute<T>() {
        return { token: this.session.token(), user: this.session.user<T>() };
    }
}

export class SaveSessionUseCase {
    constructor(private readonly session: SessionPort) {}
    execute(token: string, user: unknown) {
        this.session.set(token, user);
    }
}

export class UpdateSessionUserUseCase {
    constructor(private readonly session: SessionPort) {}
    execute<T extends object>(partial: Partial<T>) {
        return this.session.updateUser(partial);
    }
}

export class ClearSessionUseCase {
    constructor(private readonly session: SessionPort) {}
    execute() {
        this.session.clear();
    }
}
