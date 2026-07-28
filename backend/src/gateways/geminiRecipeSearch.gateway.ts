import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../configs/constant";
import { HttpException } from "../exceptions/http-exception";
import {
    AiRecipeCatalogItem,
    IAiRecipeSearchGateway,
} from "../useCases/aiAssistant/searchRecipes.useCase";

export class GeminiRecipeSearchGateway implements IAiRecipeSearchGateway {
    private readonly client = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

    async search(query: string, catalog: AiRecipeCatalogItem[]) {
        if (!this.client) throw new HttpException(500, "The AI assistant isn't configured on this server yet");
        const model = this.client.getGenerativeModel({
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
            raw = (await model.generateContent(prompt)).response.text();
        } catch {
            throw new HttpException(502, "The AI assistant is temporarily unavailable. Please try again.");
        }
        try {
            const parsed = JSON.parse(raw);
            return {
                message: parsed.message,
                recipeIds: Array.isArray(parsed.recipeIds) ? parsed.recipeIds.map(String) : [],
            };
        } catch {
            throw new HttpException(502, "The AI assistant returned an unexpected response. Please try again.");
        }
    }
}
