
import { ForgotPassFormSchema } from "@/schema/auth/ForgotPassSchema";
import { LoginFormSchema } from "@/schema/auth/LoginFormShema";
import { registerFormSchema } from "@/schema/auth/RegisterSchema";
import z from "zod";

/**
 * Interface pour l'inscription (SignUp)
 * Reflète les champs requis par votre SignUpDTO
 */
export interface SignUpData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  passwordConfirm: string;
}

/**
 * Interface pour la connexion (Login)
 * Reflète les champs requis par votre LoginDto
 */
export interface LoginData {
  email: string;
  password: string;
}







/**
 * Interface pour Mots de passe oublier (E)
 * Reflète les champs requis par votre SignUpDTO
 */
export interface EmailData {
  email: string;
}






export type LoginFormInputs = z.infer<typeof LoginFormSchema>;
export type RegisterFormInputs = z.infer<typeof registerFormSchema>;
export type EmailFormInputs = z.infer<typeof ForgotPassFormSchema>;

