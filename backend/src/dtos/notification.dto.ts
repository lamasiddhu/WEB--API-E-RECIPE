import { z } from "zod";

export const BroadcastAnnouncementDTO = z.object({
    message: z.string().min(1, "Message is required"),
});
export type BroadcastAnnouncementDTO = z.infer<typeof BroadcastAnnouncementDTO>;

export const RespondProRequestDTO = z.object({
    action: z.enum(["approve", "reject"]),
});
export type RespondProRequestDTO = z.infer<typeof RespondProRequestDTO>;

export const SendPersonalNotificationDTO = z.object({
    recipientId: z.string().min(1, "Recipient is required"),
    title: z.string().min(1, "Title is required").optional(),
    message: z.string().min(1, "Message is required"),
});
