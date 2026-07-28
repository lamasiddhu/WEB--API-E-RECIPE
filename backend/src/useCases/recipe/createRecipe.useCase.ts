import { CreateRecipeInput } from "../inputs";
import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";
import { IRecipeCache } from "../../ports/recipeCache.port";
import { stripVideoIfFree } from "./recipePolicy";
import { INotificationRepository } from "../../ports/repositories/notification.repository.port";
import { RecipeRequester } from "../../entities/recipe.entity";
export class CreateRecipeUseCase {
    constructor(
        private readonly repository: IRecipeRepository,
        private readonly cache: IRecipeCache,
        private readonly notifications: INotificationRepository
    ) {}
    async execute(data: CreateRecipeInput, requester: RecipeRequester, submitForApproval = false) {
        const isAdmin = requester.role === "admin";
        const recipe = await this.repository.create({
            ...stripVideoIfFree(data),
            createdBy: requester.id,
            approvalStatus: submitForApproval && !isAdmin ? "pending" : "approved",
        });

        if (isAdmin) {
            await this.notifications.create({
                audience: "all",
                type: "new_recipe",
                title: "New dish from E-RECIPE",
                message: `E-RECIPE has a new dish now: ${recipe.title}! Please check it out.`,
                relatedRecipeId: recipe._id,
                relatedRecipeTitle: recipe.title,
                imageUrl: recipe.imageUrl,
                senderName: "E-RECIPE",
            });
        } else if (submitForApproval) {
            await this.notifications.create({
                audience: "admin",
                type: "recipe_submission",
                title: "New recipe awaiting review",
                message: `${requester.fullName || "A Pro member"} submitted ${recipe.title} for approval.`,
                relatedUserId: requester.id,
                relatedUserName: requester.fullName,
                relatedRecipeId: recipe._id,
                relatedRecipeTitle: recipe.title,
                imageUrl: recipe.imageUrl,
                senderName: "E-RECIPE",
                status: "pending",
            });
        }

        this.cache.invalidate();
        return recipe;
    }
}
