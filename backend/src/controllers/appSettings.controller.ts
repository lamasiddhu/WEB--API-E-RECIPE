import { Request, Response } from "express";
import { z } from "zod";
import { AppSettingsService } from "../services/appSettings.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const appSettingsService = new AppSettingsService();

const SetMaintenanceModeDTO = z.object({
    maintenanceMode: z.boolean(),
});

export class AppSettingsController {
    async getSettings(req: Request, res: Response) {
        try {
            const settings = await appSettingsService.getSettings();
            return ApiResponseHelper.success(res, settings, "Settings fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async setMaintenanceMode(req: Request, res: Response) {
        try {
            const parsed = SetMaintenanceModeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const settings = await appSettingsService.setMaintenanceMode(parsed.data.maintenanceMode);
            return ApiResponseHelper.success(res, settings, "Maintenance mode updated");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async clearCache(req: Request, res: Response) {
        try {
            const settings = await appSettingsService.clearCache();
            return ApiResponseHelper.success(res, settings, "Cache cleared");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
