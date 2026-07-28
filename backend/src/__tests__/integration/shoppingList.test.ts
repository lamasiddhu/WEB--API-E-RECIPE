import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RecipeModel } from "../../models/recipe.model";
import { ShoppingListItemModel } from "../../models/shoppingListItem.model";
import { OrderModel } from "../../models/order.model";

describe("Shopping List API Integration Tests", () => {
    const emails = {
        plain: "jest_shop_plain@example.com",
        pro: "jest_shop_pro@example.com",
    };
    let plainToken: string;
    let plainId: string;
    let proToken: string;
    let normalRecipeId: string;
    let proRecipeId: string;

    const registerAndLogin = async (email: string, extra: Record<string, unknown> = {}) => {
        await UserModel.deleteOne({ email });
        await request(app)
            .post("/api/v1/auth/register")
            .send({ fullName: "Shop Test", email, password: "password123" });
        if (Object.keys(extra).length > 0) {
            await UserModel.updateOne({ email }, { $set: extra });
        }
        const res = await request(app).post("/api/v1/auth/login").send({ email, password: "password123" });
        return { token: res.body.data.token as string, id: res.body.data.user._id as string };
    };

    beforeAll(async () => {
        const plain = await registerAndLogin(emails.plain);
        plainToken = plain.token;
        plainId = plain.id;
        const pro = await registerAndLogin(emails.pro, { isPro: true });
        proToken = pro.token;

        const normalRecipe = await RecipeModel.create({ title: "Jest Shop Normal Recipe", badge: "Normal", price: 250 });
        normalRecipeId = String(normalRecipe._id);
        const proRecipe = await RecipeModel.create({ title: "Jest Shop Pro Recipe", badge: "Pro", price: 0 });
        proRecipeId = String(proRecipe._id);
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: Object.values(emails) } });
        await RecipeModel.deleteMany({ title: { $regex: "^Jest Shop " } });
        await ShoppingListItemModel.deleteMany({ userId: plainId });
        await OrderModel.deleteMany({ customer: "Jest Shop Test" });
    });

    test("should reject shopping-list access without authentication", async () => {
        const res = await request(app).get("/api/v1/shopping-list");
        expect(res.statusCode).toBe(401);
    });

    test("should add a recipe to the shopping list, ignoring a client-supplied price", async () => {
        const res = await request(app)
            .post("/api/v1/shopping-list")
            .set("Authorization", `Bearer ${plainToken}`)
            .send({ recipeId: normalRecipeId, title: "Jest Shop Normal Recipe", price: 0 });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.price).toBe(250); // the recipe's real price, not the client-sent 0
    });

    test("should reject adding a Pro-tier recipe for a non-Pro user", async () => {
        const res = await request(app)
            .post("/api/v1/shopping-list")
            .set("Authorization", `Bearer ${plainToken}`)
            .send({ recipeId: proRecipeId, title: "Jest Shop Pro Recipe" });
        expect(res.statusCode).toBe(403);
    });

    test("should allow a Pro user to add a Pro-tier recipe", async () => {
        const res = await request(app)
            .post("/api/v1/shopping-list")
            .set("Authorization", `Bearer ${proToken}`)
            .send({ recipeId: proRecipeId, title: "Jest Shop Pro Recipe" });
        expect(res.statusCode).toBe(201);
    });

    test("should checkout, clear the basket, and grant purchased access", async () => {
        const checkoutRes = await request(app)
            .post("/api/v1/shopping-list/checkout")
            .set("Authorization", `Bearer ${plainToken}`)
            .send({ customerName: "Jest Shop Test", format: "digital" });
        expect(checkoutRes.statusCode).toBe(201);
        expect(checkoutRes.body.data.price).toBe(250);

        const listRes = await request(app)
            .get("/api/v1/shopping-list")
            .set("Authorization", `Bearer ${plainToken}`);
        expect(listRes.body.data).toHaveLength(0);

        const meRes = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${plainToken}`);
        expect(meRes.body.data.purchasedRecipeIds).toContain(normalRecipeId);
    });
});
