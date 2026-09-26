"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAppDispatch } from "@/store/hooks";
import { resetPassword } from "@/store/authSlice";

function ResetPasswordForm() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(resetPassword({ token, email, password, password_confirmation: confirmation })).unwrap();
      setComplete(true);
    } catch (cause) {
      setError(cause && typeof cause === "object" && "message" in cause ? String(cause.message) : "Ce lien est invalide ou expiré. Demandez-en un nouveau.");
    } finally {
      setSubmitting(false);
    }
  }

  return <AuthShell image="/auth/ForgotPassword.png" imageAlt="Illustration de sécurisation du compte Naya" caption="Quelques instants pour choisir un nouveau mot de passe et retrouver votre compte.">
    <Link href="/auth" className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-950"><ArrowLeft className="size-4" /> Retour à la connexion</Link>
    {complete ? <div className="mt-7 border border-emerald-200 bg-emerald-50 p-6"><CheckCircle2 className="size-8 text-emerald-700" /><h1 className="mt-4 font-serif text-3xl text-zinc-950">Mot de passe modifié</h1><p className="mt-3 text-sm leading-6 text-zinc-700">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p><Link href="/auth" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider underline underline-offset-4">Se connecter <ArrowRight className="size-4" /></Link></div> : <>
      <h1 className="mt-5 font-serif text-4xl text-zinc-950 sm:text-5xl">Nouveau mot de <em className="font-normal">passe.</em></h1>
      <p className="mt-4 break-all text-sm leading-6 text-zinc-600">{email ? `Choisissez un nouveau mot de passe pour ${email}.` : "Choisissez un nouveau mot de passe pour votre compte."}</p>
      {(!token || !email) && <p role="alert" className="mt-5 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Le lien est incomplet. Utilisez le lien reçu par e-mail ou demandez une nouvelle réinitialisation.</p>}
      {error && <p role="alert" className="mt-5 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      <form onSubmit={submit} className="mt-7 space-y-5">
        <label htmlFor="new-password" className="block text-xs font-medium text-zinc-700">Nouveau mot de passe<span className="relative mt-2 block"><LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><input id="new-password" type={visible ? "text" : "password"} autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" className="h-12 w-full border border-zinc-900/15 bg-white pl-10 pr-12 text-sm outline-none focus:border-zinc-500" /><button type="button" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setVisible((value) => !value)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-zinc-500">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>
        <label htmlFor="confirm-password" className="block text-xs font-medium text-zinc-700">Confirmer le nouveau mot de passe<input id="confirm-password" type={visible ? "text" : "password"} autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Saisissez-le à nouveau" className="mt-2 h-12 w-full border border-zinc-900/15 bg-white px-3 text-sm outline-none focus:border-zinc-500" /></label>
        <button type="submit" disabled={submitting || !token || !email} className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-zinc-950 px-5 text-xs font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></button>
      </form>
    </>}</AuthShell>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-[60vh] px-5 py-24 text-center text-sm text-zinc-500">Chargement…</main>}><ResetPasswordForm /></Suspense>;
}
