import * as bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID, SECRET_KEY } from "../../configs/constant";
import { User } from "../../entities/user.entity";
import {
    IClock,
    ICodeGenerator,
    IGoogleIdentityGateway,
    IPasswordHasher,
    IPasswordResetMailer,
    ISecretGenerator,
    ITokenService,
} from "../../ports/security.port";
import { sendPasswordResetCodeEmail } from "../../utils/mailer.util";

export class BcryptPasswordHasher implements IPasswordHasher {
    hash(value: string): Promise<string> {
        return bcryptjs.hash(value, 10);
    }

    compare(value: string, hash: string): Promise<boolean> {
        return bcryptjs.compare(value, hash);
    }
}

export class JwtTokenService implements ITokenService {
    sign(user: User): string {
        return jwt.sign({ id: user._id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "30d" });
    }

    verify(token: string): { id: string; email?: string; role?: string } {
        return jwt.verify(token, SECRET_KEY) as { id: string; email?: string; role?: string };
    }
}

export class GoogleIdentityGateway implements IGoogleIdentityGateway {
    private readonly client = new OAuth2Client(GOOGLE_CLIENT_ID);

    isConfigured(): boolean {
        return Boolean(GOOGLE_CLIENT_ID);
    }

    async verify(idToken: string) {
        try {
            const payload = (await this.client.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID,
            })).getPayload();
            if (!payload?.email || !payload.email_verified) return { error: "unverified-email" as const };
            return {
                identity: { email: payload.email, name: payload.name, picture: payload.picture },
            };
        } catch {
            return { error: "invalid-token" as const };
        }
    }
}

export class PasswordResetMailer implements IPasswordResetMailer {
    sendCode(email: string, code: string): Promise<void> {
        return sendPasswordResetCodeEmail(email, code);
    }
}

export class SixDigitCodeGenerator implements ICodeGenerator {
    generate(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}

export class RandomSecretGenerator implements ISecretGenerator {
    generate(): string {
        return crypto.randomUUID();
    }
}

export class SystemClock implements IClock {
    now(): Date {
        return new Date();
    }
}
