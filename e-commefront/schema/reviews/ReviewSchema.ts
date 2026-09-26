import { z } from "zod";

export const createReviewSchema = z.object({
  order_item_id: z.string().uuid("Article de commande invalide."),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).nullable().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
