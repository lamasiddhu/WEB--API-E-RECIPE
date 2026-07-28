import { AppSettings } from "../../entities/appSettings.entity";

export interface IAppSettingsRepository {
    get(): Promise<AppSettings>;
    update(data: Partial<AppSettings>): Promise<AppSettings>;
}
