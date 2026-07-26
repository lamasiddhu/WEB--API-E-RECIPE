import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);

userRouter.get("/me", authorizedMiddleware, userController.getMe);
userRouter.put("/me", authorizedMiddleware, userController.updateMe);
userRouter.put("/me/password", authorizedMiddleware, userController.changeMyPassword);
userRouter.put("/me/password/reset", authorizedMiddleware, userController.setNewPassword);
userRouter.post("/me/favorites/:recipeId", authorizedMiddleware, userController.addFavorite);
userRouter.delete("/me/favorites/:recipeId", authorizedMiddleware, userController.removeFavorite);

export default userRouter;
