import { IAppSettingsRepository } from "../../ports/repositories/appSettings.repository.port";
import { IRecipeCache } from "../../ports/recipeCache.port";
import { IClock } from "../../ports/security.port";

export class ClearCacheUseCase {
    constructor(
        private readonly appSettingsRepository: IAppSettingsRepository,
        private readonly cache: IRecipeCache,
        private readonly clock: IClock
    ) {}

    async execute() {
        this.cache.invalidate();
        return this.appSettingsRepository.update({ cacheLastClearedAt: this.clock.now() });
    }
}
