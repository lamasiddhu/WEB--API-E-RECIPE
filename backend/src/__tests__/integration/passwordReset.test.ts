import request from "supertest";
import bcryptjs from "bcryptjs";
import app from "../../app";
import { UserModel } from "../../models/user.model";

// Never make real SMTP calls in tests — the send is fire-and-forget in the
// real service, so a mocked no-op here doesn't change what's being tested
// (the API contract), just avoids a real network attempt to a fake domain.
jest.mock("../../utils/mailer.util", () => ({
    sendPasswordResetCodeEmail: jest.fn().mockResolvedValue(undefined),
}));

describe("Password Reset (OTP) API Integration Tests", () => {
    const testUser = {
        fullName: "Reset Test User",
        email: "jest_reset_user@example.com",
        password: "password123",
    };
    const KNOWN_CODE = "654321";

    beforeAll(async () => {
        await UserModel.deleteOne({ email: testUser.email });
        await request(app).post("/api/v1/auth/register").send(testUser);
    });

    afterAll(async () => {
        await UserModel.deleteOne({ email: testUser.email });
    });

    // Seed a known, predictable reset code directly in the DB (bypassing the
    // random generator + email step) so the success path can be tested.
    const seedKnownCode = async (attempts = 0) => {
        const codeHash = await bcryptjs.hash(KNOWN_CODE, 10);
        await UserModel.updateOne(
            { email: testUser.email },
            {
                passwordResetCode: codeHash,
                passwordResetCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
                passwordResetAttempts: attempts,
            }
        );
    };

    test("should respond identically for a non-existent email (no enumeration)", async () => {
        const res = await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({ email: "doesnotexist_jest@example.com" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("should generate and store a reset code for an existing email", async () => {
        const res = await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({ email: testUser.email });

        expect(res.statusCode).toBe(200);
        const user = await UserModel.findOne({ email: testUser.email });
        expect(user?.passwordResetCode).toBeTruthy();
        expect(user?.passwordResetCodeExpiresAt).toBeTruthy();
    });

    test("should reject verify-reset-code with a wrong code", async () => {
        await seedKnownCode();
        const res = await request(app)
            .post("/api/v1/auth/verify-reset-code")
            .send({ email: testUser.email, code: "000000" });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("should verify successfully with the correct code", async () => {
        await seedKnownCode();
        const res = await request(app)
            .post("/api/v1/auth/verify-reset-code")
            .send({ email: testUser.email, code: KNOWN_CODE });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("should lock out after 5 incorrect attempts, then reset the lockout after requesting a fresh code", async () => {
        await seedKnownCode();
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post("/api/v1/auth/verify-reset-code")
                .send({ email: testUser.email, code: "111111" });
        }
        const lockedRes = await request(app)
            .post("/api/v1/auth/verify-reset-code")
            .send({ email: testUser.email, code: "111111" });
        expect(lockedRes.statusCode).toBe(429);

        await request(app).post("/api/v1/auth/forgot-password").send({ email: testUser.email });
        const user = await UserModel.findOne({ email: testUser.email });
        expect(user?.passwordResetAttempts).toBe(0);
    });

    test("should reject reset-password-code with a wrong code", async () => {
        await seedKnownCode();
        const res = await request(app)
            .post("/api/v1/auth/reset-password-code")
            .send({ email: testUser.email, code: "999999", newPassword: "newpassword123" });

        expect(res.statusCode).toBe(400);
    });

    test("should reset the password successfully and allow login with it", async () => {
        await seedKnownCode();
        const resetRes = await request(app)
            .post("/api/v1/auth/reset-password-code")
            .send({ email: testUser.email, code: KNOWN_CODE, newPassword: "brandnewpassword123" });

        expect(resetRes.statusCode).toBe(200);

        const loginRes = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: testUser.email, password: "brandnewpassword123" });

        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.data.token).toBeDefined();
    });
});
