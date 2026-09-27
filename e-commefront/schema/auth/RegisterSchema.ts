import { z } from "zod";

export const registerFormSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "L'email est requis" })
      .email({ message: "Adresse email invalide" }),

    first_name: z
      .string()
      .min(2, { message: "Prénom trop court" }),

    last_name: z
      .string()
      .min(2, { message: "Nom trop court" }),

    phone: z
      .string()
      .max(20, { message: "Le numéro de téléphone est trop long" })
      .min(8, { message: "Numéro de téléphone trop court" }),

    password: z
      .string()
      .max(20, { message: "Le numéro de téléphone est trop long" })
      .min(8, {
        message: "Le mot de passe doit faire au moins 8 caractères",
      })
      .refine(
        (value) => {
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumber = /[0-9]/.test(value);

          return hasUpperCase && hasLowerCase && hasNumber;
        },
        {
          message:
            "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre",
        },
      ),

    confirmPassword: z
      .string()
      .min(1, {
        message: "La confirmation du mot de passe est requise",
      }),

    terms: z
      .boolean()
      .refine((value) => value === true, {
        message: "Vous devez accepter les conditions d'utilisation",
      }),
    privacyNoticeAcknowledged: z.boolean().refine((value) => value === true, { message: "Vous devez confirmer avoir lu la politique de confidentialité" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type RegisterFormInputs = z.infer<typeof registerFormSchema>;