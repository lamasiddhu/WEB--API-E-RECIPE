// Composition root: the one place in the app that knows about concrete
// (Mongo-backed) implementations. Every service receives its dependencies
// through its constructor instead of constructing them itself, so services
// depend only on the repository interfaces (IUserRepository, IRecipeRepository,
// etc.) — not on Mongoose or MongoDB directly. Swapping persistence layers
// later would mean writing a new repository class here, not touching any service.
import { UserMongoRepository } from "./repositories/user.repository";
import { RecipeMongoRepository } from "./repositories/recipe.repository";
import { OrderMongoRepository } from "./repositories/order.repository";
import { ShoppingListItemMongoRepository } from "./repositories/shoppingListItem.repository";
import { NotificationMongoRepository } from "./repositories/notification.repository";
import { FoodProfileMongoRepository } from "./repositories/foodProfile.repository";
import { AppSettingsMongoRepository } from "./repositories/appSettings.repository";
import { ReviewMongoRepository } from "./repositories/review.repository";

import { GetFoodProfileUseCase } from "./useCases/foodProfile/getFoodProfile.useCase";
import { SaveFoodProfileUseCase } from "./useCases/foodProfile/saveFoodProfile.useCase";
import { GetAppSettingsUseCase } from "./useCases/appSettings/getAppSettings.useCase";
import { SetMaintenanceModeUseCase } from "./useCases/appSettings/setMaintenanceMode.useCase";
import { ClearCacheUseCase } from "./useCases/appSettings/clearCache.useCase";
import { GetAllOrdersUseCase } from "./useCases/order/getAllOrders.useCase";
import { GetMyOrdersUseCase } from "./useCases/order/getMyOrders.useCase";
import { CreateOrderUseCase } from "./useCases/order/createOrder.useCase";
import { AcceptOrderUseCase } from "./useCases/order/acceptOrder.useCase";
import { CancelOrderUseCase } from "./useCases/order/cancelOrder.useCase";
import { DeleteOrderUseCase } from "./useCases/order/deleteOrder.useCase";
import { RequestProUseCase } from "./useCases/notification/requestPro.useCase";
import { RespondToProRequestUseCase } from "./useCases/notification/respondToProRequest.useCase";
import { NotifyOrderAcceptedUseCase } from "./useCases/notification/notifyOrderAccepted.useCase";
import { NotifyOrderCancelledUseCase } from "./useCases/notification/notifyOrderCancelled.useCase";
import { BroadcastAnnouncementUseCase } from "./useCases/notification/broadcastAnnouncement.useCase";
import { GetNotificationsUseCase } from "./useCases/notification/getNotifications.useCase";
import { MarkReadUseCase } from "./useCases/notification/markRead.useCase";
import { MarkAllReadUseCase } from "./useCases/notification/markAllRead.useCase";
import { ClearAllUseCase } from "./useCases/notification/clearAll.useCase";
import { NotifyPasswordResetRequestedUseCase } from "./useCases/notification/notifyPasswordResetRequested.useCase";
import { NotifyWelcomeUseCase } from "./useCases/notification/notifyWelcome.useCase";
import { SendPersonalNotificationUseCase } from "./useCases/notification/sendPersonalNotification.useCase";
import { RespondToRecipeSubmissionUseCase } from "./useCases/notification/respondToRecipeSubmission.useCase";
import { GetAllUsersUseCase } from "./useCases/adminUser/getAllUsers.useCase";
import { GetUserByIdUseCase } from "./useCases/adminUser/getUserById.useCase";
import { CreateUserUseCase } from "./useCases/adminUser/createUser.useCase";
import { UpdateUserUseCase } from "./useCases/adminUser/updateUser.useCase";
import { UpdatePasswordUseCase } from "./useCases/adminUser/updatePassword.useCase";
import { RequestPasswordResetUseCase } from "./useCases/adminUser/requestPasswordReset.useCase";
import { DeleteUserUseCase } from "./useCases/adminUser/deleteUser.useCase";
import { RemovePurchasedRecipeUseCase } from "./useCases/adminUser/removePurchasedRecipe.useCase";
import { GetMyShoppingListUseCase } from "./useCases/shoppingListItem/getMyList.useCase";
import { AddShoppingListItemUseCase } from "./useCases/shoppingListItem/addItem.useCase";
import { UpdateShoppingListQuantityUseCase } from "./useCases/shoppingListItem/updateQuantity.useCase";
import { RemoveShoppingListItemUseCase } from "./useCases/shoppingListItem/removeItem.useCase";
import { CheckoutShoppingListUseCase } from "./useCases/shoppingListItem/checkout.useCase";
import { GetAllRecipesUseCase } from "./useCases/recipe/getAllRecipes.useCase";
import { GetRecipeByIdUseCase } from "./useCases/recipe/getRecipeById.useCase";
import { CreateRecipeUseCase } from "./useCases/recipe/createRecipe.useCase";
import { UpdateRecipeUseCase } from "./useCases/recipe/updateRecipe.useCase";
import { DeleteRecipeUseCase } from "./useCases/recipe/deleteRecipe.useCase";
import { GetAllRecipesForAdminUseCase } from "./useCases/recipe/getAllRecipesForAdmin.useCase";
import { AddFavoriteUseCase, ChangeMyPasswordUseCase, GetMeUseCase, GoogleLoginUseCase, GrantPurchasedRecipesUseCase, LoginUserUseCase, RegisterUserUseCase, RemoveFavoriteUseCase, RemovePurchasedRecipeFromLibraryUseCase, RequestPasswordResetCodeUseCase, ResetPasswordWithCodeUseCase, SetNewPasswordUseCase, UpdateMeUseCase, VerifyResetCodeUseCase } from "./useCases/user/user.useCases";
import { SearchRecipesUseCase } from "./useCases/aiAssistant/searchRecipes.useCase";
import { GeminiRecipeSearchGateway } from "./gateways/geminiRecipeSearch.gateway";
import {
    BcryptPasswordHasher,
    GoogleIdentityGateway,
    JwtTokenService,
    PasswordResetMailer,
    RandomSecretGenerator,
    SixDigitCodeGenerator,
    SystemClock,
} from "./infrastructure/security/security.adapters";
import { InMemoryRecipeCache } from "./infrastructure/cache/recipeCache.adapter";
import { CreateReviewUseCase, DeleteReviewUseCase, GetAllReviewsUseCase, GetRecipeReviewsUseCase, UpdateReviewUseCase } from "./useCases/review/review.useCases";

// Repositories
export const userRepository = new UserMongoRepository();
const recipeRepository = new RecipeMongoRepository();
const orderRepository = new OrderMongoRepository();
const shoppingListItemRepository = new ShoppingListItemMongoRepository();
const notificationRepository = new NotificationMongoRepository();
const foodProfileRepository = new FoodProfileMongoRepository();
const appSettingsRepository = new AppSettingsMongoRepository();
const reviewRepository = new ReviewMongoRepository();
const aiRecipeSearchGateway = new GeminiRecipeSearchGateway();
export const tokenService = new JwtTokenService();
const passwordHasher = new BcryptPasswordHasher();
const googleIdentityGateway = new GoogleIdentityGateway();
const passwordResetMailer = new PasswordResetMailer();
const resetCodeGenerator = new SixDigitCodeGenerator();
const secretGenerator = new RandomSecretGenerator();
const clock = new SystemClock();
const recipeCache = new InMemoryRecipeCache();

// Services (constructed in dependency order — anything a service needs
// must already exist above it)
export const getAppSettingsUseCase = new GetAppSettingsUseCase(appSettingsRepository);
export const requestProUseCase = new RequestProUseCase(userRepository, notificationRepository);
export const respondToProRequestUseCase = new RespondToProRequestUseCase(notificationRepository, userRepository);
export const notifyOrderAcceptedUseCase = new NotifyOrderAcceptedUseCase(notificationRepository);
export const notifyOrderCancelledUseCase = new NotifyOrderCancelledUseCase(notificationRepository);
export const broadcastAnnouncementUseCase = new BroadcastAnnouncementUseCase(notificationRepository);
export const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
export const markNotificationReadUseCase = new MarkReadUseCase(notificationRepository);
export const markAllNotificationsReadUseCase = new MarkAllReadUseCase(notificationRepository);
export const clearAllNotificationsUseCase = new ClearAllUseCase(notificationRepository);
export const notifyPasswordResetRequestedUseCase = new NotifyPasswordResetRequestedUseCase(notificationRepository);
export const notifyWelcomeUseCase = new NotifyWelcomeUseCase(notificationRepository);
export const sendPersonalNotificationUseCase = new SendPersonalNotificationUseCase(notificationRepository, userRepository);
export const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher, notifyWelcomeUseCase);
export const loginUserUseCase = new LoginUserUseCase(userRepository, getAppSettingsUseCase, passwordHasher, tokenService);
export const googleLoginUseCase = new GoogleLoginUseCase(
    userRepository,
    getAppSettingsUseCase,
    googleIdentityGateway,
    passwordHasher,
    tokenService,
    secretGenerator,
    notifyWelcomeUseCase
);
export const getMeUseCase = new GetMeUseCase(userRepository);
export const updateMeUseCase = new UpdateMeUseCase(userRepository);
export const addFavoriteUseCase = new AddFavoriteUseCase(userRepository);
export const removeFavoriteUseCase = new RemoveFavoriteUseCase(userRepository);
export const removePurchasedRecipeFromLibraryUseCase = new RemovePurchasedRecipeFromLibraryUseCase(userRepository);
export const setNewPasswordUseCase = new SetNewPasswordUseCase(userRepository, passwordHasher);
export const changeMyPasswordUseCase = new ChangeMyPasswordUseCase(userRepository, passwordHasher);
export const requestPasswordResetCodeUseCase = new RequestPasswordResetCodeUseCase(
    userRepository,
    passwordHasher,
    resetCodeGenerator,
    clock,
    passwordResetMailer
);
export const verifyResetCodeUseCase = new VerifyResetCodeUseCase(userRepository, passwordHasher, clock);
export const resetPasswordWithCodeUseCase = new ResetPasswordWithCodeUseCase(userRepository, passwordHasher, clock);
export const grantPurchasedRecipesUseCase = new GrantPurchasedRecipesUseCase(userRepository);
export const getAllRecipesUseCase = new GetAllRecipesUseCase(recipeRepository, recipeCache, reviewRepository);
export const getAllRecipesForAdminUseCase = new GetAllRecipesForAdminUseCase(recipeRepository);
export const getRecipeByIdUseCase = new GetRecipeByIdUseCase(recipeRepository, reviewRepository);
export const createRecipeUseCase = new CreateRecipeUseCase(recipeRepository, recipeCache, notificationRepository);
export const respondToRecipeSubmissionUseCase = new RespondToRecipeSubmissionUseCase(
    notificationRepository,
    recipeRepository,
    recipeCache
);
export const updateRecipeUseCase = new UpdateRecipeUseCase(recipeRepository, recipeCache);
export const deleteRecipeUseCase = new DeleteRecipeUseCase(recipeRepository, recipeCache);
export const adminGetAllUsersUseCase = new GetAllUsersUseCase(userRepository);
export const adminGetUserByIdUseCase = new GetUserByIdUseCase(userRepository);
export const adminCreateUserUseCase = new CreateUserUseCase(userRepository, passwordHasher, notifyWelcomeUseCase);
export const adminUpdateUserUseCase = new UpdateUserUseCase(userRepository);
export const adminUpdatePasswordUseCase = new UpdatePasswordUseCase(userRepository, passwordHasher);
export const adminRequestPasswordResetUseCase = new RequestPasswordResetUseCase(
    userRepository,
    notifyPasswordResetRequestedUseCase
);
export const adminDeleteUserUseCase = new DeleteUserUseCase(userRepository);
export const adminRemovePurchasedRecipeUseCase = new RemovePurchasedRecipeUseCase(userRepository);
export const getAllOrdersUseCase = new GetAllOrdersUseCase(orderRepository);
export const getMyOrdersUseCase = new GetMyOrdersUseCase(orderRepository);
export const createOrderUseCase = new CreateOrderUseCase(orderRepository, clock);
export const acceptOrderUseCase = new AcceptOrderUseCase(orderRepository, notifyOrderAcceptedUseCase);
export const cancelOrderUseCase = new CancelOrderUseCase(orderRepository, notifyOrderCancelledUseCase);
export const deleteOrderUseCase = new DeleteOrderUseCase(orderRepository);
export const getFoodProfileUseCase = new GetFoodProfileUseCase(foodProfileRepository);
export const saveFoodProfileUseCase = new SaveFoodProfileUseCase(foodProfileRepository);
export const setMaintenanceModeUseCase = new SetMaintenanceModeUseCase(appSettingsRepository);
export const clearCacheUseCase = new ClearCacheUseCase(appSettingsRepository, recipeCache, clock);
export const getMyShoppingListUseCase = new GetMyShoppingListUseCase(shoppingListItemRepository);
export const addShoppingListItemUseCase = new AddShoppingListItemUseCase(shoppingListItemRepository, recipeRepository);
export const updateShoppingListQuantityUseCase = new UpdateShoppingListQuantityUseCase(shoppingListItemRepository);
export const removeShoppingListItemUseCase = new RemoveShoppingListItemUseCase(shoppingListItemRepository);
export const checkoutShoppingListUseCase = new CheckoutShoppingListUseCase(
    shoppingListItemRepository,
    createOrderUseCase,
    { grantPurchasedRecipes: (id, recipeIds) => grantPurchasedRecipesUseCase.execute(id, recipeIds) },
    notifyOrderAcceptedUseCase
);
export const searchRecipesUseCase = new SearchRecipesUseCase(recipeRepository, aiRecipeSearchGateway);
export const getRecipeReviewsUseCase = new GetRecipeReviewsUseCase(reviewRepository);
export const createReviewUseCase = new CreateReviewUseCase(reviewRepository, recipeRepository, recipeCache);
export const getAllReviewsUseCase = new GetAllReviewsUseCase(reviewRepository);
export const updateReviewUseCase = new UpdateReviewUseCase(reviewRepository, recipeRepository, recipeCache);
export const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository, recipeRepository, recipeCache);
