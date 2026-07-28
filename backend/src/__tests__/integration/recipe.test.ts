import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RecipeModel } from "../../models/recipe.model";

describe("Recipe API Integration Tests", () => {
    const emails = {
        admin: "jest_recipe_admin@example.com",
        pro: "jest_recipe_pro@example.com",
        plain: "jest_recipe_plain@example.com",
        creator: "jest_recipe_creator@example.com",
    };

    let adminToken: string;
    let proToken: string;
    let plainToken: string;
    let creatorToken: string;
    let creatorId: string;

    const registerAndLogin = async (email: string, extra: Record<string, unknown> = {}) => {
        await UserModel.deleteOne({ email });
        await request(app)
            .post("/api/v1/auth/register")
            .send({ fullName: "Recipe Test", email, password: "password123" });
        if (Object.keys(extra).length > 0) {
            await UserModel.updateOne({ email }, { $set: extra });
        }
        const res = await request(app).post("/api/v1/auth/login").send({ email, password: "password123" });
        return { token: res.body.data.token as string, id: res.body.data.user._id as string };
    };

    beforeAll(async () => {
        const admin = await registerAndLogin(emails.admin, { role: "admin" });
        adminToken = admin.token;
        const pro = await registerAndLogin(emails.pro, { isPro: true });
        proToken = pro.token;
        const plain = await registerAndLogin(emails.plain);
        plainToken = plain.token;
        const creator = await registerAndLogin(emails.creator, { isPro: true });
        creatorToken = creator.token;
        creatorId = creator.id;
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: Object.values(emails) } });
        await RecipeModel.deleteMany({ title: { $regex: "^Jest Recipe " } });
    });

    describe("GET /api/v1/recipes", () => {
        test("should list recipes publicly without authentication", async () => {
            const res = await request(app).get("/api/v1/recipes");
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe("Entitlement gating", () => {
        let normalRecipeId: string;
        let proRecipeId: string;

        beforeAll(async () => {
            const normalRes = await request(app)
                .post("/api/v1/recipes")
                .set("Authorization", `Bearer ${creatorToken}`)
                .send({
                    title: "Jest Recipe Normal",
                    badge: "Normal",
                    price: 10,
                    ingredients: ["secret ingredient"],
                    steps: [{ title: "Step 1", description: "secret step" }],
                });
            normalRecipeId = normalRes.body.data._id;

            const proRes = await request(app)
                .post("/api/v1/recipes")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    title: "Jest Recipe Pro",
                    badge: "Pro",
                    videoUrl: "https://www.youtube.com/watch?v=abcdefghijk",
                    ingredients: ["pro secret ingredient"],
                    steps: [{ title: "Step 1", description: "pro secret step" }],
                });
            proRecipeId = proRes.body.data._id;
        });

        test("should hide ingredients/steps/video from unentitled viewers (anon on Normal, non-Pro on Pro)", async () => {
            const normalRes = await request(app).get(`/api/v1/recipes/${normalRecipeId}`);
            expect(normalRes.body.data.ingredients).toHaveLength(0);
            expect(normalRes.body.data.steps).toHaveLength(0);

            const proRes = await request(app)
                .get(`/api/v1/recipes/${proRecipeId}`)
                .set("Authorization", `Bearer ${plainToken}`);
            expect(proRes.body.data.ingredients).toHaveLength(0);
            expect(proRes.body.data.videoUrl).toBeUndefined();
        });

        test("should reveal full content to the recipe's own creator", async () => {
            const res = await request(app)
                .get(`/api/v1/recipes/${normalRecipeId}`)
                .set("Authorization", `Bearer ${creatorToken}`);
            expect(res.body.data.ingredients.length).toBeGreaterThan(0);
        });

        test("should reveal full content to a Pro user for both Normal and Pro tier recipes", async () => {
            const normalRes = await request(app)
                .get(`/api/v1/recipes/${normalRecipeId}`)
                .set("Authorization", `Bearer ${proToken}`);
            const proRes = await request(app)
                .get(`/api/v1/recipes/${proRecipeId}`)
                .set("Authorization", `Bearer ${proToken}`);

            expect(normalRes.body.data.ingredients.length).toBeGreaterThan(0);
            expect(proRes.body.data.videoUrl).toBeTruthy();
        });

        test("should reveal Normal-tier content once purchased", async () => {
            await UserModel.updateOne({ email: emails.plain }, { $addToSet: { purchasedRecipeIds: normalRecipeId } });
            const res = await request(app)
                .get(`/api/v1/recipes/${normalRecipeId}`)
                .set("Authorization", `Bearer ${plainToken}`);
            expect(res.body.data.ingredients.length).toBeGreaterThan(0);
        });

        test("should clear videoUrl when a Pro recipe is downgraded to Free", async () => {
            const updateRes = await request(app)
                .put(`/api/v1/recipes/${proRecipeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ badge: "Free" });
            expect(updateRes.statusCode).toBe(200);

            const anonRes = await request(app).get(`/api/v1/recipes/${proRecipeId}`);
            expect(anonRes.body.data.videoUrl).toBeFalsy();
        });
    });

    describe("Create/update permissions", () => {
        test("should reject recipe creation without authentication", async () => {
            const res = await request(app).post("/api/v1/recipes").send({ title: "Jest Recipe Unauthed" });
            expect(res.statusCode).toBe(401);
        });

        test("should reject recipe creation by a non-Pro, non-admin user", async () => {
            const res = await request(app)
                .post("/api/v1/recipes")
                .set("Authorization", `Bearer ${plainToken}`)
                .send({ title: "Jest Recipe Plain Attempt" });
            expect(res.statusCode).toBe(403);
        });

        test("should allow a Pro user to create a recipe", async () => {
            const res = await request(app)
                .post("/api/v1/recipes")
                .set("Authorization", `Bearer ${proToken}`)
                .send({ title: "Jest Recipe By Pro", badge: "Free" });
            expect(res.statusCode).toBe(201);
        });

        test("should enforce update ownership: non-owner rejected, owner allowed, admin bypasses", async () => {
            const created = await request(app)
                .post("/api/v1/recipes")
                .set("Authorization", `Bearer ${creatorToken}`)
                .send({ title: "Jest Recipe Ownership Test", badge: "Free" });
            const recipeId = created.body.data._id;

            const hijackRes = await request(app)
                .put(`/api/v1/recipes/${recipeId}`)
                .set("Authorization", `Bearer ${proToken}`)
                .send({ title: "Hijacked Title" });
            expect(hijackRes.statusCode).toBe(403);

            const selfRes = await request(app)
                .put(`/api/v1/recipes/${recipeId}`)
                .set("Authorization", `Bearer ${creatorToken}`)
                .send({ title: "Jest Recipe Self Update - Edited" });
            expect(selfRes.statusCode).toBe(200);
            expect(selfRes.body.data.title).toBe("Jest Recipe Self Update - Edited");

            const adminRes = await request(app)
                .put(`/api/v1/recipes/${recipeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ title: "Jest Recipe Admin Edited" });
            expect(adminRes.statusCode).toBe(200);
            expect(adminRes.body.data.title).toBe("Jest Recipe Admin Edited");
        });
    });
});
