import { Recipe, User } from "./entities";

export type RecipeTier = "free" | "normal" | "pro";

export function getRecipeTier(recipe: Pick<Recipe, "badge">): RecipeTier {
    const tier = (recipe.badge || "Free").toLowerCase();
    if (tier === "pro") return "pro";
    if (tier === "normal") return "normal";
    return "free";
}

export function canAccessRecipe(
    recipe: Pick<Recipe, "_id" | "badge" | "createdBy">,
    user: Pick<User, "_id" | "role" | "isPro" | "purchasedRecipeIds"> | null | undefined
): boolean {
    const tier = getRecipeTier(recipe);
    if (tier === "free") return true;
    if (user?.role === "admin") return true;
    if (recipe.createdBy && recipe.createdBy === user?._id) return true;

    const hasPurchased = !!user?.purchasedRecipeIds?.includes(recipe._id);
    return tier === "normal" ? hasPurchased : !!user?.isPro && hasPurchased;
}

export function canPurchaseRecipe(
    recipe: Pick<Recipe, "badge">,
    user: Pick<User, "role" | "isPro"> | null | undefined
): boolean {
    const tier = getRecipeTier(recipe);
    if (tier === "free") return false;
    if (user?.role === "admin") return true;
    return tier === "normal" || !!user?.isPro;
}

export function canReviewRecipe(
    recipe: Pick<Recipe, "_id" | "badge" | "createdBy">,
    user: Pick<User, "_id" | "role" | "isPro" | "purchasedRecipeIds"> | null | undefined
): boolean {
    return !!user && canAccessRecipe(recipe, user);
}
