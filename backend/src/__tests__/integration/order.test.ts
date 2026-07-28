import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { OrderModel } from "../../models/order.model";

describe("Order API Integration Tests", () => {
    const emails = {
        admin: "jest_order_admin@example.com",
        plain: "jest_order_plain@example.com",
    };
    let adminToken: string;
    let plainToken: string;

    const registerAndLogin = async (email: string, extra: Record<string, unknown> = {}) => {
        await UserModel.deleteOne({ email });
        await request(app)
            .post("/api/v1/auth/register")
            .send({ fullName: "Order Test", email, password: "password123" });
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
        await UserModel.deleteMany({ email: { $in: Object.values(emails) } });
        await OrderModel.deleteMany({ customer: "Jest Order Test" });
    });

    test("should reject GET /orders (admin-only listing) for a regular user", async () => {
        const res = await request(app).get("/api/v1/orders").set("Authorization", `Bearer ${plainToken}`);
        expect(res.statusCode).toBe(403);
    });

    test("should allow a regular user to fetch their own orders", async () => {
        const res = await request(app).get("/api/v1/orders/me").set("Authorization", `Bearer ${plainToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should reject direct order creation by a regular user", async () => {
        const res = await request(app)
            .post("/api/v1/orders")
            .set("Authorization", `Bearer ${plainToken}`)
            .send({ customer: "Jest Order Test", item: "Something x1" });
        expect(res.statusCode).toBe(403);
    });

    test("should allow an admin to create an order directly", async () => {
        const res = await request(app)
            .post("/api/v1/orders")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ customer: "Jest Order Test", item: "Something x1", format: "physical" });
        expect(res.statusCode).toBe(201);
        expect(res.body.data.status).toBe("Processing");
    });

    test("should reject order cancellation and acceptance by a non-admin", async () => {
        const cancelTarget = await OrderModel.create({
            orderNumber: `JEST-${Date.now()}`,
            customer: "Jest Order Test",
            item: "Cancel Target x1",
            format: "physical",
            status: "Processing",
        });
        const cancelRes = await request(app)
            .patch(`/api/v1/orders/${cancelTarget._id}/cancel`)
            .set("Authorization", `Bearer ${plainToken}`)
            .send({ reason: "test" });
        expect(cancelRes.statusCode).toBe(403);

        const acceptTarget = await OrderModel.create({
            orderNumber: `JEST-${Date.now()}-2`,
            customer: "Jest Order Test",
            item: "Accept Target x1",
            format: "physical",
            status: "Processing",
        });
        const acceptRes = await request(app)
            .patch(`/api/v1/orders/${acceptTarget._id}/accept`)
            .set("Authorization", `Bearer ${plainToken}`);
        expect(acceptRes.statusCode).toBe(403);
    });
});
