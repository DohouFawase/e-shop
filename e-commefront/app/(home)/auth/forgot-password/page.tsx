"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPassFormSchema, type EmailFormInputs } from "@/schema/auth/ForgotPassSchema";
import { useAppDispatch } from "@/store/hooks";
import { requestPasswordReset } from "@/store/authSlice";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmailFormInputs>({ resolver: zodResolver(ForgotPassFormSchema), mode: "onBlur", defaultValues: { email: "" } });

  async function onSubmit(data: EmailFormInputs) {
    setSubmitError(null);
    try {
      await dispatch(requestPasswordReset(data.email)).unwrap();
      setEmailSent(true);
    } catch (error) {
      setSubmitError(error && typeof error === "object" && "message" in error ? String(error.message) : "L’envoi du lien a échoué. Réessayez.");
    }
  }

  return <AuthShell image="/auth/ForgotPassword.png" imageAlt="Illustration de récupération du compte" caption="Nous vous aidons à retrouver l’accès à votre espace Naya.">
    <Link href="/auth" className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-950"><ArrowLeft className="size-4" /> Retour à la connexion</Link>
    {emailSent ? <div className="mt-7 border border-emerald-200 bg-emerald-50 p-6">
      <CheckCircle2 className="size-8 text-emerald-700" />
      <h1 className="mt-4 font-serif text-3xl text-zinc-950">Consultez votre boîte mail</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-700">Si cette adresse correspond à un compte, un lien de réinitialisation vient d’être envoyé. Pensez à vérifier vos courriers indésirables.</p>
      <Link href="/auth" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-900 underline underline-offset-4">Revenir à la connexion <ArrowRight className="size-4" /></Link>
    </div> : <>
      <h1 className="mt-5 font-serif text-4xl text-zinc-950 sm:text-5xl">Mot de passe <em className="font-normal">oublié ?</em></h1>
      <p className="mt-4 text-sm leading-6 text-zinc-600">Saisissez l’adresse e-mail de votre compte. Nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
      {submitError && <p role="alert" className="mt-6 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{submitError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <label htmlFor="email" className="block text-xs font-medium text-zinc-700">Adresse e-mail<span className="relative mt-2 block"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><input id="email" type="email" autoComplete="email" {...register("email")} placeholder="vous@exemple.com" aria-invalid={Boolean(errors.email)} className={`h-12 w-full border bg-white pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 ${errors.email ? "border-rose-500" : "border-zinc-900/15"}`} /></span>{errors.email && <span className="mt-1 block text-xs text-rose-700">{errors.email.message}</span>}</label>
        <button type="submit" disabled={isSubmitting} className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-zinc-950 px-5 text-xs font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-50">{isSubmitting ? "Envoi en cours…" : "Envoyer le lien"}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></button>
      </form>
    </>}
  </AuthShell>;
}
