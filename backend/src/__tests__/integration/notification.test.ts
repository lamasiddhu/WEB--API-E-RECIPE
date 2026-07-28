import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { NotificationModel } from "../../models/notification.model";

describe("Notification API Integration Tests", () => {
    const emails = {
        admin: "jest_notif_admin@example.com",
        userA: "jest_notif_userA@example.com",
        userB: "jest_notif_userB@example.com",
    };
    let adminToken: string;
    let userAToken: string;
    let userBToken: string;

    const registerAndLogin = async (email: string, extra: Record<string, unknown> = {}) => {
        await UserModel.deleteOne({ email });
        await request(app)
            .post("/api/v1/auth/register")
            .send({ fullName: "Notif Test", email, password: "password123" });
        if (Object.keys(extra).length > 0) {
            await UserModel.updateOne({ email }, { $set: extra });
        }
        const res = await request(app).post("/api/v1/auth/login").send({ email, password: "password123" });
        return res.body.data.token as string;
    };

    beforeAll(async () => {
        adminToken = await registerAndLogin(emails.admin, { role: "admin" });
        userAToken = await registerAndLogin(emails.userA);
        userBToken = await registerAndLogin(emails.userB);
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: Object.values(emails) } });
        await NotificationModel.deleteMany({ message: { $regex: "Jest" } });
    });

    test("should create a pro_request notification visible to admin", async () => {
        const reqRes = await request(app)
            .post("/api/v1/notifications/pro-request")
            .set("Authorization", `Bearer ${userAToken}`);
        expect(reqRes.statusCode).toBe(201);

        const listRes = await request(app)
            .get("/api/v1/notifications")
            .set("Authorization", `Bearer ${adminToken}`);
        const found = listRes.body.data.find((n: { type: string; status: string }) => n.type === "pro_request" && n.status === "pending");
        expect(found).toBeDefined();
    });

    test("should let admin approve a pro request, granting isPro", async () => {
        const listRes = await request(app)
            .get("/api/v1/notifications")
            .set("Authorization", `Bearer ${adminToken}`);
        const pending = listRes.body.data.find((n: { type: string; status: string }) => n.type === "pro_request" && n.status === "pending");

        const respondRes = await request(app)
            .patch(`/api/v1/notifications/${pending._id}/respond`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ action: "approve" });
        expect(respondRes.statusCode).toBe(200);

        const meRes = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${userAToken}`);
        expect(meRes.body.data.isPro).toBe(true);
    });

    test("should let admin reject a pro request", async () => {
        await request(app).post("/api/v1/notifications/pro-request").set("Authorization", `Bearer ${userBToken}`);
        const listRes = await request(app)
            .get("/api/v1/notifications")
            .set("Authorization", `Bearer ${adminToken}`);
        const pending = listRes.body.data.find((n: { type: string; status: string }) => n.type === "pro_request" && n.status === "pending");

        const respondRes = await request(app)
            .patch(`/api/v1/notifications/${pending._id}/respond`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ action: "reject" });
        expect(respondRes.statusCode).toBe(200);

        const meRes = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${userBToken}`);
        expect(meRes.body.data.isPro).toBe(false);
    });

    test("should mark all of a user's notifications as read", async () => {
        const res = await request(app)
            .patch("/api/v1/notifications/read-all")
            .set("Authorization", `Bearer ${userBToken}`);
        expect(res.statusCode).toBe(200);

        const listRes = await request(app)
            .get("/api/v1/notifications")
            .set("Authorization", `Bearer ${userBToken}`);
        const unread = listRes.body.data.filter((n: { isRead: boolean }) => !n.isRead);
        expect(unread).toHaveLength(0);
    });

    test("should isolate broadcast read-state per viewer", async () => {
        await request(app)
            .post("/api/v1/notifications/announce")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ message: "Jest broadcast test message" });

        const beforeA = await request(app).get("/api/v1/notifications").set("Authorization", `Bearer ${userAToken}`);
        const announcement = beforeA.body.data.find((n: { message: string }) => n.message === "Jest broadcast test message");
        expect(announcement.isRead).toBe(false);

        await request(app)
            .patch(`/api/v1/notifications/${announcement._id}/read`)
            .set("Authorization", `Bearer ${userAToken}`);

        const afterA = await request(app).get("/api/v1/notifications").set("Authorization", `Bearer ${userAToken}`);
        expect(afterA.body.data.find((n: { message: string }) => n.message === "Jest broadcast test message").isRead).toBe(true);

        // User B never read it — should still be unread for them.
        const stillB = await request(app).get("/api/v1/notifications").set("Authorization", `Bearer ${userBToken}`);
        expect(stillB.body.data.find((n: { message: string }) => n.message === "Jest broadcast test message").isRead).toBe(false);
    });

    test("should clear all notifications for a user while preserving pending pro_request items for admin", async () => {
        await request(app).post("/api/v1/notifications/pro-request").set("Authorization", `Bearer ${userBToken}`);

        const clearRes = await request(app)
            .delete("/api/v1/notifications/clear-all")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(clearRes.statusCode).toBe(200);

        const listRes = await request(app)
            .get("/api/v1/notifications")
            .set("Authorization", `Bearer ${adminToken}`);
        const stillPending = listRes.body.data.find((n: { type: string; status: string }) => n.type === "pro_request" && n.status === "pending");
        expect(stillPending).toBeDefined();
    });
});
