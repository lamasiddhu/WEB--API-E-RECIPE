import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authorizedMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const orderRouter = Router();
const orderController = new OrderController();

// Real purchases only ever go through shopping-list checkout (which calls
// OrderService.createOrder in-process, not this route). This HTTP endpoint
// exists for admins to record manual orders — it must never be reachable by
// a regular user, since it accepts an arbitrary price with no recomputation.
orderRouter.use(authorizedMiddleware);

orderRouter.get("/", adminMiddleware, orderController.getAllOrders);
orderRouter.get("/me", orderController.getMyOrders);
orderRouter.post("/", adminMiddleware, orderController.createOrder);
orderRouter.patch("/:id/cancel", adminMiddleware, orderController.cancelOrder);
orderRouter.patch("/:id/accept", adminMiddleware, orderController.acceptOrder);
orderRouter.delete("/:id", adminMiddleware, orderController.deleteOrder);

export default orderRouter;
