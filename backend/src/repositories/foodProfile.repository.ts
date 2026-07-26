import { FoodProfileModel, IFoodProfile } from "../models/foodProfile.model";

export interface IFoodProfileRepository {
    getByUserId(userId: string): Promise<IFoodProfile | null>;
    upsert(userId: string, data: Partial<IFoodProfile>): Promise<IFoodProfile>;
}

export class FoodProfileMongoRepository implements IFoodProfileRepository {
    async getByUserId(userId: string): Promise<IFoodProfile | null> {
        return await FoodProfileModel.findOne({ userId });
    }

    async upsert(userId: string, data: Partial<IFoodProfile>): Promise<IFoodProfile> {
        return await FoodProfileModel.findOneAndUpdate(
            { userId },
            { ...data, userId },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
    }
}
