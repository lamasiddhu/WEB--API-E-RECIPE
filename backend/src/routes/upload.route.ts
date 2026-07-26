import { Router, Request, Response } from "express";
import { authorizedMiddleware } from "../middlewares/auth.middleware";
import { uploadImage } from "../middlewares/upload.middleware";
import { ApiResponseHelper } from "../utils/apihelper.util";

const uploadRouter = Router();

uploadRouter.post("/", authorizedMiddleware, uploadImage.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
        return ApiResponseHelper.error(res, "No file uploaded", 400);
    }
    return ApiResponseHelper.success(res, { url: `/uploads/${req.file.filename}` }, "File uploaded successfully");
});

export default uploadRouter;
