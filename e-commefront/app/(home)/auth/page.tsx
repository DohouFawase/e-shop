"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginFormSchema } from "@/schema/auth/LoginFormShema";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/authSlice";
import type { LoginInput } from "@/types/auth/LoginType";

const inputClass = "block h-12 w-full border bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(LoginFormSchema) });

  async function onSubmit(data: LoginInput) {
    setSubmitError(null);
    try {
      const user = await dispatch(loginUser(data)).unwrap();
      router.replace(user.is_admin ? "/dashboard" : "/");
    } catch (error) {
      setSubmitError(error && typeof error === "object" && "message" in error ? String(error.message) : "La connexion a échoué. Vérifiez vos identifiants puis réessayez.");
    }
  }

  return <AuthShell image="/auth/Login.png" imageAlt="Illustration de l’espace client Naya" caption="Retrouvez vos coups de cœur, vos commandes et votre sélection Naya.">
    <h1 className="mt-3 font-serif text-4xl text-zinc-950 sm:text-5xl">Ravi de vous <em className="font-normal">revoir.</em></h1>
    <p className="mt-4 text-sm leading-6 text-zinc-600">Connectez-vous à votre compte pour retrouver votre espace personnel.</p>
    {submitError && <p role="alert" className="mt-6 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{submitError}</p>}
    <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
      <label htmlFor="email" className="block text-xs font-medium text-zinc-700">Adresse e-mail<input id="email" type="email" autoComplete="email" {...register("email")} placeholder="vous@exemple.com" aria-invalid={Boolean(errors.email)} className={`${inputClass} mt-2 ${errors.email ? "border-rose-500" : "border-zinc-900/15"}`} />{errors.email && <span className="mt-1 block text-xs text-rose-700">{errors.email.message}</span>}</label>
      <label htmlFor="password" className="block text-xs font-medium text-zinc-700">Mot de passe<span className="relative mt-2 block"><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" {...register("password")} placeholder="Votre mot de passe" aria-invalid={Boolean(errors.password)} className={`${inputClass} pr-12 ${errors.password ? "border-rose-500" : "border-zinc-900/15"}`} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-zinc-500 hover:text-zinc-900">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span>{errors.password && <span className="mt-1 block text-xs text-rose-700">{errors.password.message}</span>}</label>
      <div className="flex justify-end"><Link href="/auth/forgot-password" className="text-xs font-medium text-zinc-700 underline underline-offset-4 hover:text-[#a45a3d]">Mot de passe oublié ?</Link></div>
      <button type="submit" disabled={isSubmitting} className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-zinc-950 px-5 text-xs font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-50">{isSubmitting ? "Connexion…" : "Se connecter"}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></button>
    </form>
    <p className="mt-6 text-center text-sm text-zinc-600">Nouveau chez Naya ? <Link href="/auth/register" className="font-semibold text-zinc-950 underline underline-offset-4 hover:text-[#a45a3d]">Créer un compte</Link></p>
  </AuthShell>;
}
