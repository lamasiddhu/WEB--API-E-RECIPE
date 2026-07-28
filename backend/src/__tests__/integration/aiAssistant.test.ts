import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

// The AI assistant calls a real, paid Gemini API — tests here only verify
// this server's own auth/validation gating, never a live model call.
describe("AI Recipe Assistant API Integration Tests", () => {
    const email = "jest_ai_user@example.com";
    let token: string;

    beforeAll(async () => {
        await UserModel.deleteOne({ email });
        await request(app)
            .post("/api/v1/auth/register")
            .send({ fullName: "AI Test", email, password: "password123" });
        const res = await request(app).post("/api/v1/auth/login").send({ email, password: "password123" });
        token = res.body.data.token;
    });

    afterAll(async () => {
        await UserModel.deleteOne({ email });
    });

    test("should reject AI recipe search without authentication", async () => {
        const res = await request(app).post("/api/v1/ai/recipe-search").send({ query: "dinner" });
        expect(res.statusCode).toBe(401);
    });

    test("should reject an empty query", async () => {
        const res = await request(app)
            .post("/api/v1/ai/recipe-search")
            .set("Authorization", `Bearer ${token}`)
            .send({ query: "" });
        expect(res.statusCode).toBe(400);
    });
});
