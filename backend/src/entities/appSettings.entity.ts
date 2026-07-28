export interface AppSettings {
    _id: string;
    maintenanceMode: boolean;
    cacheLastClearedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
