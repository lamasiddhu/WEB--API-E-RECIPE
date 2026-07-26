import { Router } from "express";
import { FoodProfileController } from "../controllers/foodProfile.controller";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const foodProfileRouter = Router();
const foodProfileController = new FoodProfileController();

foodProfileRouter.use(authorizedMiddleware);

foodProfileRouter.get("/", foodProfileController.getProfile);
foodProfileRouter.put("/", foodProfileController.saveProfile);

export default foodProfileRouter;
