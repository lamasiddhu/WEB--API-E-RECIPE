import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RecipeModel } from "../../models/recipe.model";

describe("Admin User Management API Integration Tests", () => {
    const emails = {
        admin: "jest_adminmgmt_admin@example.com",
        plain: "jest_adminmgmt_plain@example.com",
        target: "jest_adminmgmt_target@example.com",
        managed: "jest_adminmgmt_managed@example.com",
    };
    let adminToken: string;
    let plainToken: string;
    let targetId: string;
    let managedId: string;
    let managedToken: string;
    let recipeId: string;

    const registerAndLogin = async (email: string, extra: Record<string, unknown> = {}) => {
        await UserModel.deleteOne({ email });
        await request(app)
            .post("/api/v1/auth/register")
            .send({ fullName: "Admin Mgmt Test", email, password: "password123" });
        if (Object.keys(extra).length > 0) {
            await UserModel.updateOne({ email }, { $set: extra });
        }
        const res = await request(app).post("/api/v1/auth/login").send({ email, password: "password123" });
        return { token: res.body.data.token as string, id: res.body.data.user._id as string };
    };

    beforeAll(async () => {
        const admin = await registerAndLogin(emails.admin, { role: "admin" });
        adminToken = admin.token;
        const plain = await registerAndLogin(emails.plain);
        plainToken = plain.token;
        const target = await registerAndLogin(emails.target);
        targetId = target.id;

        const recipe = await RecipeModel.create({ title: "Jest Admin Mgmt Recipe", badge: "Free", price: 0 });
        recipeId = String(recipe._id);
        await UserModel.updateOne({ _id: targetId }, { $addToSet: { purchasedRecipeIds: recipeId } });
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: [...Object.values(emails), emails.managed] } });
        await RecipeModel.deleteMany({ title: "Jest Admin Mgmt Recipe" });
    });

    test("should reject admin user-list access for a non-admin", async () => {
        const res = await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${plainToken}`);
        expect(res.statusCode).toBe(403);
    });

    test("should let admin create a new user directly", async () => {
        const res = await request(app)
            .post("/api/v1/admin/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ fullName: "Managed User", email: emails.managed, password: "password123" });
        expect(res.statusCode).toBe(201);
        managedId = res.body.data._id;

        const login = await request(app).post("/api/v1/auth/login").send({ email: emails.managed, password: "password123" });
        managedToken = login.body.data.token;
    });

    test("should let admin update a user's isPro flag", async () => {
        const res = await request(app)
            .put(`/api/v1/admin/users/${managedId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ isPro: true });
        expect(res.statusCode).toBe(200);
        expect(res.body.data.isPro).toBe(true);
    });

    test("should let admin remove a specific purchased recipe from a user's library", async () => {
        const res = await request(app)
            .delete(`/api/v1/admin/users/${targetId}/purchased/${recipeId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.purchasedRecipeIds).not.toContain(recipeId);
    });

    test("should reject a regular user removing another user's purchased recipe", async () => {
        await UserModel.updateOne({ _id: targetId }, { $addToSet: { purchasedRecipeIds: recipeId } });
        const res = await request(app)
            .delete(`/api/v1/admin/users/${targetId}/purchased/${recipeId}`)
            .set("Authorization", `Bearer ${managedToken}`);
        expect(res.statusCode).toBe(403);
    });

    test("should let admin delete a user", async () => {
        const res = await request(app)
            .delete(`/api/v1/admin/users/${managedId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);

        const check = await UserModel.findById(managedId);
        expect(check).toBeNull();
    });
});
