import { Router } from "express";
import { RecipeController } from "../controllers/recipe.controller";
import { authorizedMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware";
import { proOrAdminMiddleware } from "../middlewares/proOrAdmin.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const recipeRouter = Router();
const recipeController = new RecipeController();

// Public browsing. Both use optionalAuthMiddleware so an entitlement check
// can run for logged-in viewers, while anonymous viewers still get the
// (locked-down) recipes instead of a 401.
recipeRouter.get("/", optionalAuthMiddleware, recipeController.getAllRecipes);
recipeRouter.get("/admin/all", authorizedMiddleware, adminMiddleware, recipeController.getAllRecipesForAdmin);
recipeRouter.get("/:id", optionalAuthMiddleware, recipeController.getRecipeById);

// Admins and Pro members can add recipes; editing/deleting is admin-only or
// restricted to the recipe's own creator (enforced in RecipeService).
recipeRouter.post("/", authorizedMiddleware, proOrAdminMiddleware, recipeController.createRecipe);
recipeRouter.post("/submit", authorizedMiddleware, proOrAdminMiddleware, recipeController.submitRecipe);
recipeRouter.put("/:id", authorizedMiddleware, recipeController.updateRecipe);
recipeRouter.delete("/:id", authorizedMiddleware, recipeController.deleteRecipe);

export default recipeRouter;
