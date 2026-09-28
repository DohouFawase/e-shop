import { z } from "zod";

export const createOrderSchema = z.object({
  shipping_address: z.string().trim().min(1, "L’adresse de livraison est requise.").max(500),
  phone: z.string().trim().min(1, "Le téléphone est requis.").max(20),
  notes: z.string().max(1000).nullable().optional(),
  payment_method: z.enum(['cash_on_delivery', 'cinetpay', 'paystack']).optional(),
  sales_terms_accepted: z.literal(true, { error: "Vous devez accepter les conditions générales de vente." }),
});

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

export const updateOrderStatusSchema = z.object({ status: orderStatusSchema });

export const orderFiltersSchema = z.object({
  status: orderStatusSchema.optional(),
  per_page: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
