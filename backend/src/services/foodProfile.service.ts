import { FoodProfileMongoRepository } from "../repositories/foodProfile.repository";
import { FoodProfileDTO } from "../dtos/foodProfile.dto";
import { HttpException } from "../exceptions/http-exception";

const foodProfileRepository = new FoodProfileMongoRepository();

export class FoodProfileService {
    async getProfile(userId: string) {
        const profile = await foodProfileRepository.getByUserId(userId);
        if (!profile) throw new HttpException(404, "Food profile not set up yet");
        return profile;
    }

    async saveProfile(userId: string, data: FoodProfileDTO) {
        return await foodProfileRepository.upsert(userId, data);
    }
}
