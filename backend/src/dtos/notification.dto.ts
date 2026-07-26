import { z } from "zod";

export const BroadcastAnnouncementDTO = z.object({
    message: z.string().min(1, "Message is required"),
});
export type BroadcastAnnouncementDTO = z.infer<typeof BroadcastAnnouncementDTO>;

export const RespondProRequestDTO = z.object({
    action: z.enum(["approve", "reject"]),
});
export type RespondProRequestDTO = z.infer<typeof RespondProRequestDTO>;
