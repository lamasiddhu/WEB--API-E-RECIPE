import { IFoodProfileRepository } from "../../ports/repositories/foodProfile.repository.port";
import { ApplicationError } from "../../exceptions/application-error";

export class GetFoodProfileUseCase {
    constructor(private readonly foodProfileRepository: IFoodProfileRepository) {}

    async execute(userId: string) {
        const profile = await this.foodProfileRepository.getByUserId(userId);
        if (!profile) throw new ApplicationError(404, "Food profile not set up yet");
        return profile;
    }
}
