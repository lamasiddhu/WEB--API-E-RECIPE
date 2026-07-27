import { z } from "zod";

export const AiRecipeSearchDTO = z.object({
    query: z.string().min(1, "Please type a question").max(500, "Question is too long"),
});
export type AiRecipeSearchDTO = z.infer<typeof AiRecipeSearchDTO>;
