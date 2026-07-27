import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../configs/constant";
import { RecipeMongoRepository } from "../repositories/recipe.repository";
import { HttpException } from "../exceptions/http-exception";

const recipeRepository = new RecipeMongoRepository();
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface AiSearchResponse {
    message: string;
    recipeIds: string[];
}

export class AiAssistantService {
    async searchRecipes(query: string) {
        if (!genAI) {
            throw new HttpException(500, "The AI assistant isn't configured on this server yet");
        }

        // Only metadata is ever sent to the model — never ingredients/steps,
        // regardless of the asking user's entitlement. The assistant only
        // needs enough detail to match a query, and the response is rendered
        // as recipe cards, which never show ingredients either.
        const allRecipes = await recipeRepository.getAll("");
        const catalog = allRecipes.slice(0, 200).map((r) => ({
            id: String(r._id),
            title: r.title,
            category: r.category,
            badge: r.badge,
            duration: r.duration,
            difficulty: r.difficulty,
            tags: r.tags,
            price: r.price,
            rating: r.rating,
            description: r.description,
        }));

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: { responseMimeType: "application/json" },
        });

        const prompt = `You are a recipe search assistant for a cooking app called E-Recipe. A user asked a question in plain language. Pick the recipes from the catalog below that best match what they're looking for, and write a short, friendly one or two sentence explanation of your picks.

Rules:
- Only recommend recipes that appear in the catalog below — never invent a recipe that isn't listed.
- Pick at most 6 recipes, ordered from most to least relevant.
- If nothing in the catalog matches well, return an empty recipeIds array and say so honestly in your message.
- Respond with ONLY valid JSON, no markdown fences, matching exactly this shape:
{"message": string, "recipeIds": string[]}

User's question: "${query}"

Recipe catalog (JSON array):
${JSON.stringify(catalog)}`;

        let raw: string;
        try {
            const result = await model.generateContent(prompt);
            raw = result.response.text();
        } catch {
            throw new HttpException(502, "The AI assistant is temporarily unavailable. Please try again.");
        }

        let parsed: AiSearchResponse;
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new HttpException(502, "The AI assistant returned an unexpected response. Please try again.");
        }

        const requestedIds = Array.isArray(parsed.recipeIds) ? parsed.recipeIds.map(String) : [];
        const byId = new Map(allRecipes.map((r) => [String(r._id), r]));
        const orderedRecipes = requestedIds
            .map((id) => byId.get(id))
            .filter((r): r is NonNullable<typeof r> => !!r)
            .map((r) => ({
                _id: String(r._id),
                title: r.title,
                imageUrl: r.imageUrl,
                badge: r.badge,
                duration: r.duration,
                difficulty: r.difficulty,
                price: r.price,
                rating: r.rating,
                category: r.category,
            }));

        return {
            message: typeof parsed.message === "string" ? parsed.message : "Here's what I found.",
            recipes: orderedRecipes,
        };
    }
}
