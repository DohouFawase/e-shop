import z from "zod";

export const LoginFormSchema = z.object({
     email: z.string().email({ message: "Email invalide" }),
    password: z.string()
        .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
        .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule." })
        .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une minuscule." })
        .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre." }),
})



