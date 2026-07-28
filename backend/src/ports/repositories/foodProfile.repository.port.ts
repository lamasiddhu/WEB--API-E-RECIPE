import { FoodProfile } from "../../entities/foodProfile.entity";

export interface IFoodProfileRepository {
    getByUserId(userId: string): Promise<FoodProfile | null>;
    upsert(userId: string, data: Partial<FoodProfile>): Promise<FoodProfile>;
}
