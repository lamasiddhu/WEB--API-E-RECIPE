import { z } from "zod";

export const ReviewDTO = z.object({
    rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z.string().trim().min(1, "Comment is required").max(1000, "Comment must be 1000 characters or fewer"),
});
