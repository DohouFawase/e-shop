import { z } from "zod";

const categoryImageSchema = z.custom<File>(
  (value) =>
    typeof File !== "undefined" &&
    value instanceof File &&
    value.type.startsWith("image/") &&
    value.size <= 2 * 1024 * 1024,
  { message: "L’image doit être un fichier image de 2 Mo maximum." },
);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Le nom de la catégorie est requis.").max(255),
  description: z.string().nullable().optional(),
  image: categoryImageSchema.nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  image: categoryImageSchema.nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
