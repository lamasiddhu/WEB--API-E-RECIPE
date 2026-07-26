import { AppSettingsMongoRepository } from "../repositories/appSettings.repository";
import { invalidateRecipeCache } from "../utils/recipeCache.util";

const appSettingsRepository = new AppSettingsMongoRepository();

export class AppSettingsService {
    async getSettings() {
        return await appSettingsRepository.get();
    }

    async isMaintenanceModeOn(): Promise<boolean> {
        const settings = await appSettingsRepository.get();
        return settings.maintenanceMode;
    }

    async setMaintenanceMode(enabled: boolean) {
        return await appSettingsRepository.update({ maintenanceMode: enabled });
    }

    async clearCache() {
        invalidateRecipeCache();
        return await appSettingsRepository.update({ cacheLastClearedAt: new Date() });
    }
}
