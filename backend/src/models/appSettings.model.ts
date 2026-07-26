import mongoose, { Schema, Document } from "mongoose";

export interface IAppSettings extends Document {
    maintenanceMode: boolean;
    cacheLastClearedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AppSettingsSchema: Schema = new Schema<IAppSettings>(
    {
        maintenanceMode: { type: Boolean, default: false },
        cacheLastClearedAt: { type: Date },
    },
    { timestamps: true }
);

export const AppSettingsModel = mongoose.model<IAppSettings>("AppSettings", AppSettingsSchema);
