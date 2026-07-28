import { IAppSettingsRepository } from "../../ports/repositories/appSettings.repository.port";

export class GetAppSettingsUseCase {
    constructor(private readonly appSettingsRepository: IAppSettingsRepository) {}

    async execute() {
        return this.appSettingsRepository.get();
    }
}
