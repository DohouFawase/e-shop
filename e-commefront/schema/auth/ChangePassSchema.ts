import z from "zod";

export const ChangePassFormSchema = z.object({
    password: z.string()
        .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
        .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule." })
        .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une minuscule." })
        .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre." })
        .regex(/[^A-Za-z0-9]/, { message: "Le mot de passe doit contenir au moins un caractère spécial." }),
    confirmPassword: z.string()
        .min(8, { message: "Le mot de passe de confirmation doit contenir au moins 8 caractères." })
        .regex(/[A-Z]/, { message: "Le mot de passe de confirmation doit contenir au moins une majuscule." })
        .regex(/[a-z]/, { message: "Le mot de passe de confirmation doit contenir au moins une minuscule." })
        .regex(/[0-9]/, { message: "Le mot de passe de confirmation doit contenir au moins un chiffre." })
        .regex(/[^A-Za-z0-9]/, { message: "Le mot de passe de confirmation doit contenir au moins un caractère spécial." }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
});

