import {
    ChangeMyPasswordInput,
    CreateUserInput,
    GoogleLoginInput,
    LoginUserInput,
    RequestPasswordResetCodeInput,
    ResetPasswordWithCodeInput,
    SetNewPasswordInput,
    UpdateMeInput,
    VerifyResetCodeInput,
} from "../inputs";
import { User } from "../../entities/user.entity";
import { ApplicationError } from "../../exceptions/application-error";
import {
    IClock,
    ICodeGenerator,
    IGoogleIdentityGateway,
    IPasswordHasher,
    IPasswordResetMailer,
    ISecretGenerator,
    ITokenService,
} from "../../ports/security.port";
import { IUserRepository } from "../../ports/repositories/user.repository.port";

type SafeUser = Omit<User, "password">;
type MaintenanceModePort = { execute(): Promise<{ maintenanceMode: boolean }> };
type WelcomeNotificationPort = { execute(userId: string, fullName: string): Promise<unknown> };

function withoutPassword(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
}

export class RegisterUserUseCase {
    constructor(
        private readonly users: IUserRepository,
        private readonly passwords: IPasswordHasher,
        private readonly welcome: WelcomeNotificationPort
    ) {}

    async execute(data: CreateUserInput) {
        if (await this.users.getUserByEmail(data.email)) throw new ApplicationError(400, "Email already exists");
        const password = await this.passwords.hash(data.password);
        const user = await this.users.createUser({ ...data, password });
        await this.welcome.execute(user._id, user.fullName);
        return withoutPassword(user);
    }
}

export class LoginUserUseCase {
    constructor(
        private readonly users: IUserRepository,
        private readonly getSettings: MaintenanceModePort,
        private readonly passwords: IPasswordHasher,
        private readonly tokens: ITokenService
    ) {}

    async execute(data: LoginUserInput) {
        const user = await this.users.getUserByEmail(data.email);
        if (!user || !(await this.passwords.compare(data.password, user.password!))) {
            throw new ApplicationError(401, "Invalid email or password");
        }
        if (user.role !== "admin" && (await this.getSettings.execute()).maintenanceMode) {
            throw new ApplicationError(503, "The website is currently under maintenance. Please try again later.");
        }
        return { user: withoutPassword(user), token: this.tokens.sign(user) };
    }
}

export class GoogleLoginUseCase {
    constructor(
        private readonly users: IUserRepository,
        private readonly getSettings: MaintenanceModePort,
        private readonly identities: IGoogleIdentityGateway,
        private readonly passwords: IPasswordHasher,
        private readonly tokens: ITokenService,
        private readonly secrets: ISecretGenerator,
        private readonly welcome: WelcomeNotificationPort
    ) {}

    async execute(data: GoogleLoginInput) {
        if (!this.identities.isConfigured()) throw new ApplicationError(500, "Google sign-in isn't configured on this server yet");
        const verification = await this.identities.verify(data.idToken);
        if ("error" in verification) {
            if (verification.error === "unverified-email") {
                throw new ApplicationError(401, "Google account has no verified email");
            }
            throw new ApplicationError(401, "Invalid Google sign-in token");
        }
        const payload = verification.identity;
        let user = await this.users.getUserByEmail(payload.email);
        let isNewUser = false;
        if (!user) {
            user = await this.users.createUser({
                fullName: payload.name || payload.email.split("@")[0],
                email: payload.email,
                password: await this.passwords.hash(this.secrets.generate()),
                avatarUrl: payload.picture,
            });
            isNewUser = true;
        }
        if (isNewUser) await this.welcome.execute(user._id, user.fullName);
        if (user.role !== "admin" && (await this.getSettings.execute()).maintenanceMode) {
            throw new ApplicationError(503, "The website is currently under maintenance. Please try again later.");
        }
        return { user: withoutPassword(user), token: this.tokens.sign(user) };
    }
}

export class GetMeUseCase {
    constructor(private readonly users: IUserRepository) {}
    async execute(id: string) {
        const user = await this.users.getUserById(id);
        if (!user) throw new ApplicationError(404, "User not found");
        return withoutPassword(user);
    }
}

export class UpdateMeUseCase {
    constructor(private readonly users: IUserRepository) {}
    async execute(id: string, data: UpdateMeInput) {
        if (data.email) {
            const existing = await this.users.getUserByEmail(data.email);
            if (existing && existing._id !== id) throw new ApplicationError(400, "Email already exists");
        }
        // Merge notification preferences rather than replacing the whole
        // subdocument, so toggling one preference doesn't wipe the others.
        const { notificationPreferences, ...rest } = data;
        let update: Partial<User> = rest;
        if (notificationPreferences) {
            const existing = await this.users.getUserById(id);
            if (!existing) throw new ApplicationError(404, "User not found");
            update = {
                ...rest,
                notificationPreferences: { ...existing.notificationPreferences, ...notificationPreferences },
            };
        }
        const updated = await this.users.update(id, update);
        if (!updated) throw new ApplicationError(404, "User not found");
        return withoutPassword(updated);
    }
}

abstract class RecipeCollectionUseCase {
    constructor(protected readonly users: IUserRepository) {}
    protected safe(user: User | null) {
        if (!user) throw new ApplicationError(404, "User not found");
        return withoutPassword(user);
    }
}

export class AddFavoriteUseCase extends RecipeCollectionUseCase {
    async execute(id: string, recipeId: string) { return this.safe(await this.users.addFavorite(id, recipeId)); }
}
export class RemoveFavoriteUseCase extends RecipeCollectionUseCase {
    async execute(id: string, recipeId: string) { return this.safe(await this.users.removeFavorite(id, recipeId)); }
}
export class RemovePurchasedRecipeFromLibraryUseCase extends RecipeCollectionUseCase {
    async execute(id: string, recipeId: string) { return this.safe(await this.users.removePurchasedRecipe(id, recipeId)); }
}
export class GrantPurchasedRecipesUseCase {
    constructor(private readonly users: IUserRepository) {}
    async execute(id: string, recipeIds: string[]) {
        if (recipeIds.length) await this.users.grantPurchasedRecipes(id, recipeIds);
    }
}

export class SetNewPasswordUseCase {
    constructor(
        private readonly users: IUserRepository,
        private readonly passwords: IPasswordHasher
    ) {}
    async execute(id: string, data: SetNewPasswordInput) {
        const user = await this.users.getUserById(id);
        if (!user) throw new ApplicationError(404, "User not found");
        if (!user.passwordResetRequested) throw new ApplicationError(400, "No password reset was requested for your account");
        await this.users.update(id, { password: await this.passwords.hash(data.newPassword), passwordResetRequested: false });
    }
}

export class ChangeMyPasswordUseCase {
    constructor(
        private readonly users: IUserRepository,
        private readonly passwords: IPasswordHasher
    ) {}
    async execute(id: string, data: ChangeMyPasswordInput) {
        const user = await this.users.getUserById(id);
        if (!user) throw new ApplicationError(404, "User not found");
        if (!(await this.passwords.compare(data.currentPassword, user.password!))) {
            throw new ApplicationError(401, "Current password is incorrect");
        }
        await this.users.update(id, { password: await this.passwords.hash(data.newPassword) });
    }
}

export class RequestPasswordResetCodeUseCase {
    constructor(
        private readonly users: IUserRepository,
        private readonly passwords: IPasswordHasher,
        private readonly codes: ICodeGenerator,
        private readonly clock: IClock,
        private readonly mailer: IPasswordResetMailer
    ) {}
    async execute(data: RequestPasswordResetCodeInput) {
        const user = await this.users.getUserByEmail(data.email);
        // Don't reveal whether the email exists — respond the same way either way.
        if (!user) return;
        const code = this.codes.generate();
        await this.users.update(user._id, {
            passwordResetCode: await this.passwords.hash(code),
            passwordResetCodeExpiresAt: new Date(this.clock.now().getTime() + 10 * 60 * 1000),
            passwordResetAttempts: 0,
        });
        // Fire-and-forget: don't make the caller wait on the SMTP round trip.
        // Awaiting it here would make "email exists" responses measurably
        // slower than "email doesn't exist" ones, defeating the whole point
        // of responding identically either way.
        this.mailer.sendCode(user.email, code).catch(() => {});
    }
}

async function validateResetCode(
    users: IUserRepository,
    passwords: IPasswordHasher,
    clock: IClock,
    email: string,
    code: string
): Promise<User> {
    const user = await users.getUserByEmail(email);
    if (!user?.passwordResetCode || !user.passwordResetCodeExpiresAt) {
        throw new ApplicationError(400, "Invalid or expired code");
    }
    if (user.passwordResetCodeExpiresAt.getTime() < clock.now().getTime()) {
        throw new ApplicationError(400, "Invalid or expired code");
    }
    if (user.passwordResetAttempts >= 5) {
        // Lock this code out entirely rather than letting guesses continue —
        // the user has to request a fresh one.
        await users.update(user._id, { passwordResetCode: null, passwordResetCodeExpiresAt: null });
        throw new ApplicationError(429, "Too many incorrect attempts. Please request a new code.");
    }
    if (!(await passwords.compare(code, user.passwordResetCode))) {
        await users.update(user._id, { passwordResetAttempts: user.passwordResetAttempts + 1 });
        throw new ApplicationError(400, "Invalid or expired code");
    }
    return user;
}

export class VerifyResetCodeUseCase {
    constructor(
        private readonly users: IUserRepository,
        private readonly passwords: IPasswordHasher,
        private readonly clock: IClock
    ) {}
    async execute(data: VerifyResetCodeInput) {
        await validateResetCode(this.users, this.passwords, this.clock, data.email, data.code);
    }
}

export class ResetPasswordWithCodeUseCase {
    constructor(
        private readonly users: IUserRepository,
        private readonly passwords: IPasswordHasher,
        private readonly clock: IClock
    ) {}
    async execute(data: ResetPasswordWithCodeInput) {
        const user = await validateResetCode(this.users, this.passwords, this.clock, data.email, data.code);
        await this.users.update(user._id, {
            password: await this.passwords.hash(data.newPassword),
            passwordResetCode: null,
            passwordResetCodeExpiresAt: null,
        });
    }
}
