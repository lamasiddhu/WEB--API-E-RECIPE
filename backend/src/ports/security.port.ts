import { User } from "../entities/user.entity";

export interface IPasswordHasher {
    hash(value: string): Promise<string>;
    compare(value: string, hash: string): Promise<boolean>;
}

export interface ITokenService {
    sign(user: User): string;
    verify(token: string): { id: string; email?: string; role?: string };
}

export interface GoogleIdentity {
    email: string;
    name?: string;
    picture?: string;
}

export interface IGoogleIdentityGateway {
    isConfigured(): boolean;
    verify(idToken: string): Promise<
        | { identity: GoogleIdentity }
        | { error: "invalid-token" | "unverified-email" }
    >;
}

export interface IPasswordResetMailer {
    sendCode(email: string, code: string): Promise<void>;
}

export interface ICodeGenerator {
    generate(): string;
}

export interface ISecretGenerator {
    generate(): string;
}

export interface IClock {
    now(): Date;
}
