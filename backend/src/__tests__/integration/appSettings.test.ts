import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Admin App Settings API Integration Tests", () => {
    const emails = {
        admin: "jest_settings_admin@example.com",
        plain: "jest_settings_plain@example.com",
    };
    let adminToken: string;
    let plainToken: string;

    const registerAndLogin = async (email: string, extra: Record<string, unknown> = {}) => {
        await UserModel.deleteOne({ email });
        await request(app)
            .post("/api/v1/auth/register")
            .send({ fullName: "Settings Test", email, password: "password123" });
        if (Object.keys(extra).length > 0) {
            await UserModel.updateOne({ email }, { $set: extra });
        }
        const res = await request(app).post("/api/v1/auth/login").send({ email, password: "password123" });
        return res.body.data.token as string;
    };

    beforeAll(async () => {
        adminToken = await registerAndLogin(emails.admin, { role: "admin" });
        plainToken = await registerAndLogin(emails.plain);
    });

    afterAll(async () => {
        // Defensive: always leave maintenance mode off, no matter what happened
        // above, so it never leaks into any other test file's login attempts.
        await request(app)
            .put("/api/v1/admin/settings/maintenance-mode")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ maintenanceMode: false });
        await UserModel.deleteMany({ email: { $in: Object.values(emails) } });
    });

    test("should reject non-admin access to app settings", async () => {
        const res = await request(app).get("/api/v1/admin/settings").set("Authorization", `Bearer ${plainToken}`);
        expect(res.statusCode).toBe(403);
    });

    test("should fetch current app settings as admin", async () => {
        const res = await request(app).get("/api/v1/admin/settings").set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.maintenanceMode).toBe(false);
    });

    test("should block non-admin login during maintenance mode while still allowing admin login", async () => {
        try {
            const onRes = await request(app)
                .put("/api/v1/admin/settings/maintenance-mode")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ maintenanceMode: true });
            expect(onRes.body.data.maintenanceMode).toBe(true);

            const blockedLogin = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: emails.plain, password: "password123" });
            expect(blockedLogin.statusCode).toBe(503);

            const adminLogin = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: emails.admin, password: "password123" });
            expect(adminLogin.statusCode).toBe(200);
        } finally {
            await request(app)
                .put("/api/v1/admin/settings/maintenance-mode")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ maintenanceMode: false });
        }
    });

    test("should clear the recipe cache and record when it was cleared", async () => {
        const res = await request(app)
            .post("/api/v1/admin/settings/clear-cache")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.cacheLastClearedAt).toBeTruthy();
    });
});
