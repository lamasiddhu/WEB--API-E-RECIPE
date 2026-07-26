import { Router } from "express";
import { ShoppingListItemController } from "../controllers/shoppingListItem.controller";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const shoppingListRouter = Router();
const shoppingListController = new ShoppingListItemController();

shoppingListRouter.use(authorizedMiddleware);

shoppingListRouter.get("/", shoppingListController.getMyList);
shoppingListRouter.post("/", shoppingListController.addItem);
shoppingListRouter.post("/checkout", shoppingListController.checkout);
shoppingListRouter.put("/:id", shoppingListController.updateQuantity);
shoppingListRouter.delete("/:id", shoppingListController.removeItem);

export default shoppingListRouter;
