import { Recipe, RecipeRequester, RecipeViewer } from "../../entities/recipe.entity";
import { ApplicationError } from "../../exceptions/application-error";
import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";

export function filterRecipeForViewer(recipe: Recipe, viewer?: RecipeViewer) {
    const badge = recipe.badge || "Free";
    if (badge === "Free") return recipe;
    const hasPurchased = !!viewer?.purchasedRecipeIds.includes(recipe._id);
    const entitled = viewer?.role === "admin" ||
        (badge === "Normal" && hasPurchased) ||
        (badge === "Pro" && !!viewer?.isPro && hasPurchased) ||
        (!!recipe.createdBy && recipe.createdBy === viewer?.id);
    return entitled ? recipe : { ...recipe, ingredients: [], steps: [], videoUrl: undefined };
}

// Video walkthroughs only ever make sense for Normal/Pro (purchasable)
// recipes. Uses `null` rather than `undefined` because Mongo update payloads
// treat `undefined` as "field not mentioned", which would not clear an existing videoUrl.
export function stripVideoIfFree<T extends { badge?: string; videoUrl?: string }>(data: T): T {
    return data.badge === "Free" ? ({ ...data, videoUrl: null } as T) : data;
}

export async function assertCanModify(repository: IRecipeRepository, id: string, requester: RecipeRequester) {
    if (requester.role === "admin") return;
    const recipe = await repository.getById(id);
    if (!recipe) throw new ApplicationError(404, "Recipe not found");
    if (!recipe.createdBy || recipe.createdBy !== requester.id)
        throw new ApplicationError(403, "You can only edit or delete recipes you created");
}
