import { Router } from "express";
import { AppSettingsController } from "../../controllers/appSettings.controller";
import { authorizedMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const appSettingsRouter = Router();
const appSettingsController = new AppSettingsController();

appSettingsRouter.use(authorizedMiddleware, adminMiddleware);

appSettingsRouter.get("/", appSettingsController.getSettings);
appSettingsRouter.put("/maintenance-mode", appSettingsController.setMaintenanceMode);
appSettingsRouter.post("/clear-cache", appSettingsController.clearCache);

export default appSettingsRouter;
