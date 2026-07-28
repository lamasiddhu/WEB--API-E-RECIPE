import { SaveFoodProfileInput } from "../inputs";
import { IFoodProfileRepository } from "../../ports/repositories/foodProfile.repository.port";

export class SaveFoodProfileUseCase {
    constructor(private readonly foodProfileRepository: IFoodProfileRepository) {}

    async execute(userId: string, data: SaveFoodProfileInput) {
        return this.foodProfileRepository.upsert(userId, data);
    }
}
