export interface Review {
    _id: string;
    recipeId: string;
    recipeTitle: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
