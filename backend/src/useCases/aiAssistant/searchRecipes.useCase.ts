import { IRecipeRepository } from "../../ports/repositories/recipe.repository.port";

export interface AiRecipeCatalogItem {
    id: string;
    title: string;
    category: string;
    badge: string;
    duration: string;
    difficulty: string;
    tags: string[];
    price: number;
    rating: number;
    description: string;
}

export interface IAiRecipeSearchGateway {
    search(query: string, catalog: AiRecipeCatalogItem[]): Promise<{ message: string; recipeIds: string[] }>;
}

export class SearchRecipesUseCase {
    constructor(
        private readonly recipes: IRecipeRepository,
        private readonly ai: IAiRecipeSearchGateway
    ) {}

    async execute(query: string) {
        // Only metadata is ever sent to the model — never ingredients/steps,
        // regardless of the asking user's entitlement.
        const allRecipes = await this.recipes.getAll("");
        const catalog = allRecipes.slice(0, 200).map((recipe) => ({
            id: recipe._id,
            title: recipe.title,
            category: recipe.category,
            badge: recipe.badge,
            duration: recipe.duration,
            difficulty: recipe.difficulty,
            tags: recipe.tags,
            price: recipe.price,
            rating: recipe.rating,
            description: recipe.description,
        }));
        const result = await this.ai.search(query, catalog);
        const byId = new Map(allRecipes.map((recipe) => [recipe._id, recipe]));
        const orderedRecipes = result.recipeIds
            .map(String)
            .map((id) => byId.get(id))
            .filter((recipe): recipe is NonNullable<typeof recipe> => !!recipe)
            .map((recipe) => ({
                _id: recipe._id,
                title: recipe.title,
                imageUrl: recipe.imageUrl,
                badge: recipe.badge,
                duration: recipe.duration,
                difficulty: recipe.difficulty,
                price: recipe.price,
                rating: recipe.rating,
                category: recipe.category,
            }));
        return {
            message: typeof result.message === "string" ? result.message : "Here's what I found.",
            recipes: orderedRecipes,
        };
    }
}
