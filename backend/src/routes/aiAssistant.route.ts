import { Router } from "express";
import { AiAssistantController } from "../controllers/aiAssistant.controller";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const aiAssistantRouter = Router();
const aiAssistantController = new AiAssistantController();

// Logged-in only — each request calls a paid external API, so anonymous
// access is not worth the abuse/cost risk.
aiAssistantRouter.post("/recipe-search", authorizedMiddleware, aiAssistantController.searchRecipes);

export default aiAssistantRouter;
