import { z } from "zod";

export const addCartItemSchema = z.object({
  product_id: z.string().uuid("Produit invalide."),
  quantity: z.coerce.number().int().min(1, "La quantité minimale est 1."),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, "La quantité minimale est 1."),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
