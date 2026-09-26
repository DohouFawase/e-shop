import z from "zod";

export const ForgotPassFormSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
});


export type EmailFormInputs = z.infer<typeof ForgotPassFormSchema>;
