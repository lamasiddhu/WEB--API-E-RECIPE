import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const reviewRouter = Router();
const controller = new ReviewController();

reviewRouter.get("/recipe/:recipeId", controller.getForRecipe);
reviewRouter.post("/recipe/:recipeId", authorizedMiddleware, controller.create);
reviewRouter.get("/", authorizedMiddleware, adminMiddleware, controller.getAll);
reviewRouter.put("/:id", authorizedMiddleware, adminMiddleware, controller.update);
reviewRouter.delete("/:id", authorizedMiddleware, adminMiddleware, controller.delete);

export default reviewRouter;
