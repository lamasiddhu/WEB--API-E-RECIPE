import { IUserRepository } from "../../ports/repositories/user.repository.port";
import { stripPassword } from "./stripPassword";

export class GetAllUsersUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(page: number, limit: number, search: string) {
        const { users, total } = await this.userRepository.getAllPaginated(page, limit, search);
        return { users: users.map(stripPassword), total };
    }
}
