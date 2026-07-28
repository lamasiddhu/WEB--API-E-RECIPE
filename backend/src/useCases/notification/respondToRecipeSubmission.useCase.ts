import { ApplicationError } from "../../exceptions/application-error";
import { INotificationRepository } from "../../ports/repositories/notification.repository.port";
import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";
import { IRecipeCache } from "../../ports/recipeCache.port";

export class RespondToRecipeSubmissionUseCase {
    constructor(
        private readonly notifications: INotificationRepository,
        private readonly recipes: IRecipeRepository,
        private readonly cache: IRecipeCache
    ) {}

    async execute(notificationId: string, action: "approve" | "reject") {
        const request = await this.notifications.findById(notificationId);
        if (!request || request.type !== "recipe_submission") {
            throw new ApplicationError(404, "Recipe request not found");
        }
        if (request.status !== "pending") {
            throw new ApplicationError(400, "Recipe request has already been reviewed");
        }
        if (!request.relatedRecipeId || !request.relatedUserId) {
            throw new ApplicationError(400, "Recipe request is invalid");
        }

        const approvalStatus = action === "approve" ? "approved" : "rejected";
        const recipe = await this.recipes.update(request.relatedRecipeId, { approvalStatus });
        if (!recipe) throw new ApplicationError(404, "Recipe not found");

        const reviewedRequest = await this.notifications.updateStatus(notificationId, approvalStatus);
        await this.notifications.create({
            audience: "user",
            recipientId: request.relatedUserId,
            type: action === "approve" ? "recipe_approved" : "recipe_rejected",
            title: action === "approve" ? "Recipe approved" : "Recipe not approved",
            message: action === "approve"
                ? `E-RECIPE approved your recipe ${recipe.title}.`
                : `E-RECIPE did not approve your recipe ${recipe.title}.`,
            relatedRecipeId: recipe._id,
            relatedRecipeTitle: recipe.title,
            imageUrl: recipe.imageUrl,
            senderName: "E-RECIPE",
        });

        if (action === "approve") {
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
        }

        this.cache.invalidate();
        return reviewedRequest;
    }
}
