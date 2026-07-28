import { IAppSettingsRepository } from "../../ports/repositories/appSettings.repository.port";

export class SetMaintenanceModeUseCase {
    constructor(private readonly appSettingsRepository: IAppSettingsRepository) {}

    async execute(enabled: boolean) {
        return this.appSettingsRepository.update({ maintenanceMode: enabled });
    }
}
