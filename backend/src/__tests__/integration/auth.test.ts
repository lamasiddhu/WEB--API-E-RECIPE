import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Auth API Integration Tests", () => {
    const testUser = {
        fullName: "Test User",
        email: "jest_auth_user@example.com",
        password: "password123",
    };

    beforeAll(async () => {
        await UserModel.deleteOne({ email: testUser.email });
    });

    afterAll(async () => {
        await UserModel.deleteOne({ email: testUser.email });
    });

    describe("POST /api/v1/auth/register", () => {
        test("should reject registration with missing fields", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({ email: testUser.email });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send(testUser);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(testUser.email);
            expect(res.body.data.role).toBe("user");
            expect(res.body.data.password).toBeUndefined();
        });

        test("should reject a duplicate email registration", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send(testUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test("should strip a client-supplied role:admin during registration", async () => {
            const email = "jest_auth_escalation@example.com";
            await UserModel.deleteOne({ email });

            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({ fullName: "Escalation Test", email, password: "password123", role: "admin" });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.role).toBe("user");

            await UserModel.deleteOne({ email });
        });
    });

    describe("POST /api/v1/auth/login", () => {
        test("should login successfully with valid credentials", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: testUser.email, password: testUser.password });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.email).toBe(testUser.email);
        });

        test("should reject login with invalid credentials (wrong password or unknown email)", async () => {
            const wrongPassRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: testUser.email, password: "wrongpassword" });
            expect(wrongPassRes.statusCode).toBe(401);
            expect(wrongPassRes.body.success).toBe(false);

            const unknownEmailRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "doesnotexist_jest@example.com", password: "password123" });
            expect(unknownEmailRes.statusCode).toBe(401);
            expect(unknownEmailRes.body.success).toBe(false);
        });
    });

    describe("GET/PUT /api/v1/auth/me", () => {
        let token: string;

        beforeAll(async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: testUser.email, password: testUser.password });
            token = res.body.data.token;
        });

        test("should reject GET /me without a token", async () => {
            const res = await request(app).get("/api/v1/auth/me");
            expect(res.statusCode).toBe(401);
        });

        test("should fetch the logged-in user's own profile", async () => {
            const res = await request(app)
                .get("/api/v1/auth/me")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.email).toBe(testUser.email);
        });

        test("should reject a self-service isPro:true escalation via PUT /me", async () => {
            const res = await request(app)
                .put("/api/v1/auth/me")
                .set("Authorization", `Bearer ${token}`)
                .send({ isPro: true });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.isPro).toBe(false);
        });
    });
});
