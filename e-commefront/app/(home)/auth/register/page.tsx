"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthShell } from "@/components/auth/AuthShell";
import { registerFormSchema, type RegisterFormInputs } from "@/schema/auth/RegisterSchema";
import { useAppDispatch } from "@/store/hooks";
import { registerUser } from "@/store/authSlice";

const inputClass = "block h-12 w-full border bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500";

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerFormSchema),
    mode: "onBlur",
    defaultValues: { email: "", first_name: "", last_name: "", phone: "", password: "", confirmPassword: "", terms: false },
  });

  async function onSubmit(data: RegisterFormInputs) {
    const { confirmPassword, terms, ...userData } = data;
    void terms;
    setSubmitError(null);
    try {
      await dispatch(registerUser({
        ...userData,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Abidjan",
        password_confirmation: confirmPassword,
      })).unwrap();
      router.replace("/");
    } catch (error) {
      setSubmitError(error && typeof error === "object" && "message" in error ? String(error.message) : "L’inscription a échoué. Vérifiez les informations et réessayez.");
    }
  }

  function fieldError(name: keyof RegisterFormInputs) {
    return errors[name]?.message;
  }

  return <AuthShell image="/auth/SignUp.png" imageAlt="Illustration de création d’un compte Naya" caption="Créez votre espace et gardez vos découvertes préférées à portée de main.">
    <Link href="/auth" className="mt-7 inline-flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-950"><ArrowLeft className="size-4" /> Déjà un compte ? Se connecter</Link>
    <h1 className="mt-4 font-serif text-4xl text-zinc-950 sm:text-5xl">Créer votre <em className="font-normal">compte.</em></h1>
    <p className="mt-3 text-sm leading-6 text-zinc-600">Quelques informations suffisent pour rejoindre la boutique Naya.</p>
    {submitError && <p role="alert" className="mt-5 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{submitError}</p>}
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="first_name" className="block text-xs font-medium text-zinc-700">Prénom<input id="first_name" autoComplete="given-name" {...register("first_name")} placeholder="Votre prénom" aria-invalid={Boolean(errors.first_name)} className={`${inputClass} mt-2 ${errors.first_name ? "border-rose-500" : "border-zinc-900/15"}`} />{fieldError("first_name") && <span className="mt-1 block text-xs text-rose-700">{fieldError("first_name")}</span>}</label>
        <label htmlFor="last_name" className="block text-xs font-medium text-zinc-700">Nom<input id="last_name" autoComplete="family-name" {...register("last_name")} placeholder="Votre nom" aria-invalid={Boolean(errors.last_name)} className={`${inputClass} mt-2 ${errors.last_name ? "border-rose-500" : "border-zinc-900/15"}`} />{fieldError("last_name") && <span className="mt-1 block text-xs text-rose-700">{fieldError("last_name")}</span>}</label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="email" className="block text-xs font-medium text-zinc-700">Adresse e-mail<input id="email" type="email" autoComplete="email" {...register("email")} placeholder="vous@exemple.com" aria-invalid={Boolean(errors.email)} className={`${inputClass} mt-2 ${errors.email ? "border-rose-500" : "border-zinc-900/15"}`} />{fieldError("email") && <span className="mt-1 block text-xs text-rose-700">{fieldError("email")}</span>}</label>
        <label htmlFor="phone" className="block text-xs font-medium text-zinc-700">Téléphone<input id="phone" type="tel" autoComplete="tel" {...register("phone")} placeholder="Votre numéro" aria-invalid={Boolean(errors.phone)} className={`${inputClass} mt-2 ${errors.phone ? "border-rose-500" : "border-zinc-900/15"}`} />{fieldError("phone") && <span className="mt-1 block text-xs text-rose-700">{fieldError("phone")}</span>}</label>
      </div>
      <label htmlFor="password" className="block text-xs font-medium text-zinc-700">Mot de passe<span className="relative mt-2 block"><input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("password")} placeholder="8 caractères minimum" aria-invalid={Boolean(errors.password)} className={`${inputClass} pr-12 ${errors.password ? "border-rose-500" : "border-zinc-900/15"}`} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-zinc-500">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span>{fieldError("password") && <span className="mt-1 block text-xs text-rose-700">{fieldError("password")}</span>}</label>
      <label htmlFor="confirmPassword" className="block text-xs font-medium text-zinc-700">Confirmer le mot de passe<span className="relative mt-2 block"><input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" {...register("confirmPassword")} placeholder="Saisissez-le à nouveau" aria-invalid={Boolean(errors.confirmPassword)} className={`${inputClass} pr-12 ${errors.confirmPassword ? "border-rose-500" : "border-zinc-900/15"}`} /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-zinc-500">{showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span>{fieldError("confirmPassword") && <span className="mt-1 block text-xs text-rose-700">{fieldError("confirmPassword")}</span>}</label>
      <label className="flex items-start gap-2 text-xs leading-5 text-zinc-600"><input type="checkbox" {...register("terms")} className="mt-1 accent-zinc-900" /><span>J’accepte les <Link href="/terms" className="underline underline-offset-2">conditions d’utilisation</Link> et la <Link href="/privacy" className="underline underline-offset-2">politique de confidentialité</Link>.</span></label>
      {fieldError("terms") && <p className="text-xs text-rose-700">{fieldError("terms")}</p>}
      <button type="submit" disabled={isSubmitting} className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-zinc-950 px-5 text-xs font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-50">{isSubmitting ? "Création du compte…" : "Créer mon compte"}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></button>
    </form>
  </AuthShell>;
}
