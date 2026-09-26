import { z } from "zod";

export const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(255).optional(),
  last_name: z.string().trim().min(1).max(255).optional(),
  phone: z.string().trim().min(1).max(20).optional(),
  location: z.string().trim().min(1).max(255).optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
  email: z.string().trim().email().max(255).optional(),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Le mot de passe actuel est requis."),
    password: z.string().min(8).regex(/[A-Za-z]/).regex(/[0-9]/),
    password_confirmation: z.string().min(1),
  })
  .refine((value) => value.password === value.password_confirmation, {
    path: ["password_confirmation"],
    message: "Les nouveaux mots de passe ne correspondent pas.",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
