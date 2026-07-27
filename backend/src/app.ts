import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import userRouter from "./routes/user.route";
import adminUserRouter from "./routes/admin/user.route";
import recipeRouter from "./routes/recipe.route";
import orderRouter from "./routes/order.route";
import foodProfileRouter from "./routes/foodProfile.route";
import uploadRouter from "./routes/upload.route";
import shoppingListRouter from "./routes/shoppingListItem.route";
import notificationRouter from "./routes/notification.route";
import appSettingsRouter from "./routes/admin/settings.route";
import aiAssistantRouter from "./routes/aiAssistant.route";

const app: Application = express();

const corsConfiguration = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsConfiguration));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ NEW - Parse cookies
app.use(morgan("combined"));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/admin/users", adminUserRouter);
app.use("/api/v1/recipes", recipeRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/food-profile", foodProfileRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/shopping-list", shoppingListRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/admin/settings", appSettingsRouter);
app.use("/api/v1/ai", aiAssistantRouter);

app.use((req: Request, res: Response) => {
  return res.status(404).json({ message: "Endpoint not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error occurred:", err);

  if (err instanceof HttpException) {
    return ApiResponseHelper.error(res, err.message, err.status);
  }

  return ApiResponseHelper.error(res, "Internal Server Error", 500);
});

export default app;
