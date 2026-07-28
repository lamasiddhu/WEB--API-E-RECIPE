import { FoodProfileModel, IFoodProfile } from "../models/foodProfile.model";
import { FoodProfile } from "../entities/foodProfile.entity";
import { IFoodProfileRepository } from "../ports/repositories/foodProfile.repository.port";

export class FoodProfileMongoRepository implements IFoodProfileRepository {
    private toEntity(doc: IFoodProfile): FoodProfile {
        return {
            _id: String(doc._id),
            userId: String(doc.userId),
            dietaryPreference: doc.dietaryPreference,
            allergies: doc.allergies,
            spiceLevel: doc.spiceLevel,
            cookingSkill: doc.cookingSkill,
            mealsPerWeek: doc.mealsPerWeek,
            preferredCuisine: doc.preferredCuisine,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            version: (doc as IFoodProfile & { __v: number }).__v,
        };
    }

    async getByUserId(userId: string): Promise<FoodProfile | null> {
        const profile = await FoodProfileModel.findOne({ userId });
        return profile ? this.toEntity(profile) : null;
    }

    async upsert(userId: string, data: Partial<FoodProfile>): Promise<FoodProfile> {
        const profile = await FoodProfileModel.findOneAndUpdate(
            { userId },
            { ...data, userId },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return this.toEntity(profile);
    }
}
