import { Router } from "express";
import { AdminUserController } from "../../controllers/adminUser.controller";
import { authorizedMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { parseMultipartFields } from "../../middlewares/upload.middleware";

const adminUserRouter = Router();
const adminUserController = new AdminUserController();

adminUserRouter.use(authorizedMiddleware, adminMiddleware);

adminUserRouter.get("/", adminUserController.getAllUsers);
adminUserRouter.get("/:id", adminUserController.getUserById);
adminUserRouter.post("/", adminUserController.createUser);
adminUserRouter.put("/:id", parseMultipartFields, adminUserController.updateUser);
adminUserRouter.put("/:id/password", adminUserController.updatePassword);
adminUserRouter.post("/:id/request-password-reset", adminUserController.requestPasswordReset);
adminUserRouter.delete("/:id", adminUserController.deleteUser);
adminUserRouter.delete("/:id/purchased/:recipeId", adminUserController.removeUserPurchasedRecipe);

export default adminUserRouter;
