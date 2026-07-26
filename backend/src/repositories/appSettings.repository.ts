import { AppSettingsModel, IAppSettings } from "../models/appSettings.model";

export interface IAppSettingsRepository {
    get(): Promise<IAppSettings>;
    update(data: Partial<IAppSettings>): Promise<IAppSettings>;
}

// Singleton document — there's only ever one settings record, so every
// operation targets the same (upserted) doc rather than an id.
export class AppSettingsMongoRepository implements IAppSettingsRepository {
    async get(): Promise<IAppSettings> {
        const existing = await AppSettingsModel.findOne({});
        if (existing) return existing;
        return await AppSettingsModel.create({});
    }

    async update(data: Partial<IAppSettings>): Promise<IAppSettings> {
        return await AppSettingsModel.findOneAndUpdate({}, data, { new: true, upsert: true });
    }
}
