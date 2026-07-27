import { Request, Response } from "express";
import { z } from "zod";
import { AiAssistantService } from "../services/aiAssistant.service";
import { AiRecipeSearchDTO } from "../dtos/aiAssistant.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const aiAssistantService = new AiAssistantService();

export class AiAssistantController {
    async searchRecipes(req: Request, res: Response) {
        try {
            const parsed = AiRecipeSearchDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const result = await aiAssistantService.searchRecipes(parsed.data.query);
            return ApiResponseHelper.success(res, result, "AI search completed");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
