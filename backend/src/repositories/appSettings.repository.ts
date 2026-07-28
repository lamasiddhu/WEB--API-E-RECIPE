import { AppSettingsModel, IAppSettings } from "../models/appSettings.model";
import { AppSettings } from "../entities/appSettings.entity";
import { IAppSettingsRepository } from "../ports/repositories/appSettings.repository.port";

// Singleton document — there's only ever one settings record, so every
// operation targets the same (upserted) doc rather than an id.
export class AppSettingsMongoRepository implements IAppSettingsRepository {
    private toEntity(doc: IAppSettings): AppSettings {
        return {
            _id: String(doc._id),
            maintenanceMode: doc.maintenanceMode,
            cacheLastClearedAt: doc.cacheLastClearedAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            version: (doc as IAppSettings & { __v: number }).__v,
        };
    }

    async get(): Promise<AppSettings> {
        const existing = await AppSettingsModel.findOne({});
        if (existing) return this.toEntity(existing);
        return this.toEntity(await AppSettingsModel.create({}));
    }

    async update(data: Partial<AppSettings>): Promise<AppSettings> {
        const updated = await AppSettingsModel.findOneAndUpdate({}, data, { new: true, upsert: true });
        return this.toEntity(updated);
    }
}
