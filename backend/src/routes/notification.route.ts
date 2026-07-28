import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.use(authorizedMiddleware);

notificationRouter.get("/", notificationController.getMyNotifications);
notificationRouter.post("/pro-request", notificationController.requestPro);
notificationRouter.patch("/read-all", notificationController.markAllRead);
notificationRouter.delete("/clear-all", notificationController.clearAll);
notificationRouter.patch("/:id/read", notificationController.markRead);
notificationRouter.patch("/:id/respond", adminMiddleware, notificationController.respondToProRequest);
notificationRouter.patch("/:id/respond-recipe", adminMiddleware, notificationController.respondToRecipeSubmission);
notificationRouter.post("/announce", adminMiddleware, notificationController.broadcastAnnouncement);
notificationRouter.post("/personal", adminMiddleware, notificationController.sendPersonalNotification);

export default notificationRouter;
