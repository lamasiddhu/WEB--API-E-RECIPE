interface AccessUser {
    role?: string;
    isPro?: boolean;
    purchasedRecipeIds?: string[];
}

export function getRecipeTier(recipe: { badge?: string }): "free" | "normal" | "pro" {
    const tier = (recipe.badge || "Free").toLowerCase();
    if (tier === "pro") return "pro";
    if (tier === "normal") return "normal";
    return "free";
}

// Whether the user can currently see this recipe's ingredients/steps.
export function canAccessRecipe(
    recipe: { _id: string; badge?: string },
    user: AccessUser | null | undefined
): boolean {
    const tier = getRecipeTier(recipe);
    if (tier === "free") return true;
    if (user?.role === "admin") return true;
    if (user?.isPro) return true;
    // Normal recipes unlock once bought individually; Pro recipes only unlock
    // through Pro membership — they can't be purchased one at a time.
    if (tier === "normal" && user?.purchasedRecipeIds?.includes(recipe._id)) return true;
    return false;
}

// Whether this recipe can be bought individually through the basket at all.
export function isRecipePurchasable(recipe: { badge?: string }): boolean {
    return getRecipeTier(recipe) !== "pro";
}
