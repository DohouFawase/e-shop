import { z } from "zod";

const imageFileSchema = z.custom<File>(
  (value) =>
    typeof File !== "undefined" &&
    value instanceof File &&
    value.type.startsWith("image/") &&
    value.size <= 2 * 1024 * 1024,
  { message: "Chaque image doit être une image de 2 Mo maximum." },
);

const requiredNonNegativeNumber = (message: string) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number({ message }).min(0, message),
  );

const requiredNonNegativeInteger = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().min(0, "Le stock doit être un entier positif."),
);

const optionalNonNegativeInteger = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().int().min(0).optional(),
).optional();

const optionalNonNegativeNumber = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.number().min(0).nullable(),
).optional();

const optionalDate = z
  .string()
  .nullable()
  .optional()
  .refine(
    (value) => value == null || value === "" || Number.isFinite(Date.parse(value)),
    "La date est invalide.",
  );

const productFields = {
  category_id: z.string().uuid("La catégorie est invalide."),
  name: z.string().trim().min(1, "Le nom du produit est requis.").max(255),
  description: z.string().nullable().optional(),
  price: requiredNonNegativeNumber("Le prix doit être un nombre positif."),
  unit: z.string().trim().min(1, "L’unité est requise.").max(50),
  stock_quantity: requiredNonNegativeInteger,
  images: z.array(imageFileSchema).max(5, "Maximum 5 images.").optional(),
  discount_price: optionalNonNegativeNumber,
  discount_starts_at: optionalDate,
  discount_ends_at: optionalDate,
};

export const createProductSchema = z.object(productFields).superRefine((product, ctx) => {
  if (
    product.discount_price != null &&
    product.discount_price >= product.price
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["discount_price"],
      message: "Le prix remisé doit être inférieur au prix normal.",
    });
  }

  if (
    product.discount_starts_at &&
    product.discount_ends_at &&
    Date.parse(product.discount_ends_at) <= Date.parse(product.discount_starts_at)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["discount_ends_at"],
      message: "La fin de la remise doit être après son début.",
    });
  }
});

export const updateProductSchema = z.object({
  category_id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  price: requiredNonNegativeNumber("Le prix doit être un nombre positif.").optional(),
  unit: z.string().trim().min(1).max(50).optional(),
  stock_quantity: optionalNonNegativeInteger,
  is_active: z.boolean().optional(),
  images: z.array(imageFileSchema).max(5).optional(),
  discount_price: optionalNonNegativeNumber,
  discount_starts_at: optionalDate,
  discount_ends_at: optionalDate,
});

export const productFiltersSchema = z.object({
  category_id: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  in_stock: z.preprocess(
    (value) => value === true || value === "true" || value === "1" || value === 1,
    z.boolean(),
  ).optional(),
  is_active: z.preprocess((value) => {
    if (value === true || value === "true" || value === "1" || value === 1) return true;
    if (value === false || value === "false" || value === "0" || value === 0) return false;
    return value;
  }, z.boolean()).optional(),
  sort_by: z.enum(["created_at", "price", "name", "stock_quantity"]).optional(),
  sort_direction: z.enum(["asc", "desc"]).optional(),
  per_page: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
}).superRefine((filters, ctx) => {
  if (filters.min_price != null && filters.max_price != null && filters.min_price > filters.max_price) {
    ctx.addIssue({
      code: "custom",
      path: ["max_price"],
      message: "Le prix maximum doit être supérieur ou égal au prix minimum.",
    });
  }
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;
