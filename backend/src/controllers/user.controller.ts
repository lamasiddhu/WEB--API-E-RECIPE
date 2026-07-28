import { z } from "zod";
import {
    CreateUserDTO,
    LoginUserDTO,
    UpdateMeDTO,
    ChangeMyPasswordDTO,
    SetNewPasswordDTO,
    RequestPasswordResetCodeDTO,
    VerifyResetCodeDTO,
    ResetPasswordWithCodeDTO,
    GoogleLoginDTO,
} from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";
import { addFavoriteUseCase, changeMyPasswordUseCase, getMeUseCase, googleLoginUseCase, loginUserUseCase, registerUserUseCase, removeFavoriteUseCase, removePurchasedRecipeFromLibraryUseCase, requestPasswordResetCodeUseCase, resetPasswordWithCodeUseCase, setNewPasswordUseCase, updateMeUseCase, verifyResetCodeUseCase } from "../container";

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(userData.error), 400);
            }
            const user = await registerUserUseCase.execute(userData.data);
            return ApiResponseHelper.success(res, user, "User created successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
    
    async loginUser(req: Request, res: Response) {
        try{
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsedData.error), 400);
            }
            const { user, token } = await loginUserUseCase.execute(parsedData.data);
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        }catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async googleLogin(req: Request, res: Response) {
        try {
            const parsed = GoogleLoginDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            const { user, token } = await googleLoginUseCase.execute(parsed.data);
            return ApiResponseHelper.success(res, { user, token }, "Signed in with Google successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getMe(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const user = await getMeUseCase.execute(userId);
            return ApiResponseHelper.success(res, user, "Profile fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateMe(req: Request, res: Response) {
        try {
            const parsed = UpdateMeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            const user = await updateMeUseCase.execute(userId, parsed.data);
            return ApiResponseHelper.success(res, user, "Profile updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async addFavorite(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const user = await addFavoriteUseCase.execute(userId, String(req.params.recipeId));
            return ApiResponseHelper.success(res, user, "Recipe added to favorites");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async removeFavorite(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const user = await removeFavoriteUseCase.execute(userId, String(req.params.recipeId));
            return ApiResponseHelper.success(res, user, "Recipe removed from favorites");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async removePurchasedRecipe(req: Request, res: Response) {
        try {
            const userId = String((req.user as any)._id);
            const user = await removePurchasedRecipeFromLibraryUseCase.execute(userId, String(req.params.recipeId));
            return ApiResponseHelper.success(res, user, "Recipe removed from your library");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async setNewPassword(req: Request, res: Response) {
        try {
            const parsed = SetNewPasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            await setNewPasswordUseCase.execute(userId, parsed.data);
            return ApiResponseHelper.success(res, null, "Password set successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async changeMyPassword(req: Request, res: Response) {
        try {
            const parsed = ChangeMyPasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = String((req.user as any)._id);
            await changeMyPasswordUseCase.execute(userId, parsed.data);
            return ApiResponseHelper.success(res, null, "Password changed successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async requestPasswordResetCode(req: Request, res: Response) {
        try {
            const parsed = RequestPasswordResetCodeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            await requestPasswordResetCodeUseCase.execute(parsed.data);
            return ApiResponseHelper.success(res, null, "If that email exists, a reset code has been sent");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async verifyResetCode(req: Request, res: Response) {
        try {
            const parsed = VerifyResetCodeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            await verifyResetCodeUseCase.execute(parsed.data);
            return ApiResponseHelper.success(res, null, "Code verified");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async resetPasswordWithCode(req: Request, res: Response) {
        try {
            const parsed = ResetPasswordWithCodeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsed.error), 400);
            }
            await resetPasswordWithCodeUseCase.execute(parsed.data);
            return ApiResponseHelper.success(res, null, "Password reset successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
