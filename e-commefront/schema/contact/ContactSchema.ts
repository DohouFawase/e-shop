import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.string().trim().email("Adresse e-mail invalide.").max(255),
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10, "Votre message doit contenir au moins 10 caractères.").max(5000),
  privacy_notice_acknowledged: z.literal(true, { error: "Veuillez confirmer avoir lu la politique de confidentialité." }),
});

export type ContactMessageInput = z.infer<typeof contactSchema>;
