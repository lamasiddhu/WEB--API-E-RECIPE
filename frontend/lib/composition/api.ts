import { ExecuteAsyncOperationUseCase, ExecuteSyncOperationUseCase } from "../application/useCases/executeOperation.useCase";
import { AsyncFunctionAdapter, SyncFunctionAdapter } from "../infrastructure/adapters/function.adapter";
import * as authApi from "../api/auth";
import * as recipeApi from "../api/recipe";
import * as orderApi from "../api/order";
import * as shoppingListApi from "../api/shoppingList";
import * as notificationApi from "../api/notification";
import * as aiApi from "../api/aiAssistant";
import * as uploadApi from "../api/upload";
import * as adminUserApi from "../api/admin/user";
import * as settingsApi from "../api/admin/settings";
import * as reviewApi from "../api/review";
import { resolveAssetUrl as resolveAssetUrlAdapter } from "../api/axios-instance";

export type {
    AiRecipeCard,
    AppSettings,
    Notification as ApiNotification,
    Order as ApiOrder,
    OrderItem as ApiOrderItem,
    Recipe as ApiRecipe,
    ShoppingListItem as ApiShoppingListItem,
    AdminUser,
    Review as ApiReview,
} from "../domain/entities";
export type { NotificationPreferencesInput } from "../api/auth";

function asyncUseCase<Arguments extends unknown[], Result>(
    operation: (...args: Arguments) => Promise<Result>
) {
    const useCase = new ExecuteAsyncOperationUseCase(new AsyncFunctionAdapter(operation));
    return (...args: Arguments) => useCase.execute(...args);
}

function syncUseCase<Arguments extends unknown[], Result>(
    operation: (...args: Arguments) => Result
) {
    const useCase = new ExecuteSyncOperationUseCase(new SyncFunctionAdapter(operation));
    return (...args: Arguments) => useCase.execute(...args);
}

export const register = asyncUseCase(authApi.register);
export const login = asyncUseCase(authApi.login);
export const loginWithGoogle = asyncUseCase(authApi.loginWithGoogle);
export const getMe = asyncUseCase(authApi.getMe);
export const updateMe = asyncUseCase(authApi.updateMe);
export const addFavorite = asyncUseCase(authApi.addFavorite);
export const removeFavorite = asyncUseCase(authApi.removeFavorite);
export const removeMyPurchasedRecipe = asyncUseCase(authApi.removeMyPurchasedRecipe);
export const changeMyPassword = asyncUseCase(authApi.changeMyPassword);
export const setNewPassword = asyncUseCase(authApi.setNewPassword);
export const requestPasswordResetCode = asyncUseCase(authApi.requestPasswordResetCode);
export const verifyResetCode = asyncUseCase(authApi.verifyResetCode);
export const resetPasswordWithCode = asyncUseCase(authApi.resetPasswordWithCode);

export const getAllRecipes = asyncUseCase(recipeApi.getAllRecipes);
export const getAllRecipesForAdmin = asyncUseCase(recipeApi.getAllRecipesForAdmin);
export const createRecipe = asyncUseCase(recipeApi.createRecipe);
export const submitRecipe = asyncUseCase(recipeApi.submitRecipe);
export const updateRecipe = asyncUseCase(recipeApi.updateRecipe);
export const getRecipeById = asyncUseCase(recipeApi.getRecipeById);
export const deleteRecipe = asyncUseCase(recipeApi.deleteRecipe);

export const getAllOrders = asyncUseCase(orderApi.getAllOrders);
export const getMyOrders = asyncUseCase(orderApi.getMyOrders);
export const createOrder = asyncUseCase(orderApi.createOrder);
export const cancelOrder = asyncUseCase(orderApi.cancelOrder);
export const acceptOrder = asyncUseCase(orderApi.acceptOrder);
export const deleteOrder = asyncUseCase(orderApi.deleteOrder);

export const getMyShoppingList = asyncUseCase(shoppingListApi.getMyShoppingList);
export const addToShoppingList = asyncUseCase(shoppingListApi.addToShoppingList);
export const updateShoppingListQuantity = asyncUseCase(shoppingListApi.updateShoppingListQuantity);
export const removeFromShoppingList = asyncUseCase(shoppingListApi.removeFromShoppingList);
export const checkoutShoppingList = asyncUseCase(shoppingListApi.checkoutShoppingList);

export const getMyNotifications = asyncUseCase(notificationApi.getMyNotifications);
export const requestProAccess = asyncUseCase(notificationApi.requestProAccess);
export const respondToProRequest = asyncUseCase(notificationApi.respondToProRequest);
export const respondToRecipeSubmission = asyncUseCase(notificationApi.respondToRecipeSubmission);
export const sendPersonalNotification = asyncUseCase(notificationApi.sendPersonalNotification);
export const markNotificationRead = asyncUseCase(notificationApi.markNotificationRead);
export const markAllNotificationsRead = asyncUseCase(notificationApi.markAllNotificationsRead);
export const clearAllNotifications = asyncUseCase(notificationApi.clearAllNotifications);
export const broadcastAnnouncement = asyncUseCase(notificationApi.broadcastAnnouncement);

export const aiRecipeSearch = asyncUseCase(aiApi.aiRecipeSearch);
export const uploadFile = asyncUseCase(uploadApi.uploadFile);

export const getAllUsers = asyncUseCase(adminUserApi.getAllUsers);
export const getUserById = asyncUseCase(adminUserApi.getUserById);
export const createUser = asyncUseCase(adminUserApi.createUser);
export const updateUser = asyncUseCase(adminUserApi.updateUser);
export const updateUserPassword = asyncUseCase(adminUserApi.updateUserPassword);
export const requestPasswordReset = asyncUseCase(adminUserApi.requestPasswordReset);
export const deleteUser = asyncUseCase(adminUserApi.deleteUser);
export const removeUserPurchasedRecipe = asyncUseCase(adminUserApi.removeUserPurchasedRecipe);

export const getAppSettings = asyncUseCase(settingsApi.getAppSettings);
export const setMaintenanceMode = asyncUseCase(settingsApi.setMaintenanceMode);
export const clearSystemCache = asyncUseCase(settingsApi.clearSystemCache);
export const getRecipeReviews = asyncUseCase(reviewApi.getRecipeReviews);
export const submitReview = asyncUseCase(reviewApi.submitReview);
export const getAllReviews = asyncUseCase(reviewApi.getAllReviews);
export const updateReview = asyncUseCase(reviewApi.updateReview);
export const deleteReview = asyncUseCase(reviewApi.deleteReview);

export const resolveAssetUrl = syncUseCase(resolveAssetUrlAdapter);
