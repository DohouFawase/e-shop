"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Mail, MapPin, MessageCircle } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearContactFeedback, sendContactMessage } from "@/store/contactSlice";

export default function ContactPage() {
  const dispatch = useAppDispatch();
  const { status, message: successMessage, error } = useAppSelector((state) => state.contact);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      await dispatch(sendContactMessage({
        name: String(values.get("name") ?? ""),
        email: String(values.get("email") ?? ""),
        subject: String(values.get("subject") ?? ""),
        message: String(values.get("message") ?? ""),
      })).unwrap();
      form.reset();
      setSent(true);
    } catch {
      setSent(false);
    }
  }

  function writeAnotherMessage() {
    setSent(false);
    dispatch(clearContactFeedback());
  }

  return (
    <main id="main-content" className="site-container min-h-[60vh] pb-20 pt-8 sm:pt-10">
      <nav aria-label="Fil d’Ariane" className="mb-8 text-xs text-zinc-500"><Link href="/" className="hover:text-zinc-950">Accueil</Link><span className="mx-2">/</span><span className="text-zinc-900">Contact</span></nav>

      <header className="mb-10 border-b border-zinc-900/10 pb-8 sm:mb-12 sm:pb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Nous sommes à votre écoute</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Parlons de <em className="font-normal">Naya.</em></h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600">Une question sur un produit, une commande ou la boutique ? Écrivez-nous, nous serons heureux de vous aider.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <aside className="space-y-8">
          <div><h2 className="font-serif text-2xl">Restons en contact</h2><p className="mt-2 text-sm leading-6 text-zinc-600">Envoyez-nous votre demande directement depuis ce formulaire. Notre équipe vous répondra par e-mail.</p></div>
          <div className="space-y-5">
            <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center bg-[#f4f1ec] text-zinc-700"><Mail className="size-4" /></span><span><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Réponse</span><span className="mt-1 block text-sm text-zinc-900">Par e-mail à l’adresse indiquée dans votre message</span></span></div>
            <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center bg-[#f4f1ec] text-zinc-700"><MapPin className="size-4" /></span><span><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Notre boutique</span><span className="mt-1 block text-sm text-zinc-900">Côte d’Ivoire</span></span></div>
            <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center bg-[#f4f1ec] text-zinc-700"><Clock3 className="size-4" /></span><span><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Disponibilité</span><span className="mt-1 block text-sm text-zinc-900">Envoyez-nous un message à tout moment.</span></span></div>
          </div>
          <div className="border-t border-zinc-900/10 pt-6"><p className="text-xs leading-5 text-zinc-500">Pour une question liée à une commande, indiquez son numéro afin que nous puissions vous répondre plus rapidement.</p><Link href="/account/orders" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-zinc-900 underline underline-offset-4">Retrouver mes commandes <ArrowRight className="size-3.5" /></Link></div>
        </aside>

        <section className="bg-[#f7f6f3] p-5 sm:p-8 lg:p-10">
          {sent ? <div role="status" className="flex min-h-80 flex-col items-start justify-center"><CheckCircle2 className="size-9 text-emerald-700" /><h2 className="mt-5 font-serif text-2xl">Message envoyé</h2><p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">{successMessage ?? "Votre message a bien été transmis à notre équipe."}</p><button type="button" onClick={writeAnotherMessage} className="mt-6 text-xs font-semibold uppercase tracking-wider underline underline-offset-4">Écrire un autre message</button></div> : <>
            <div className="mb-7"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Écrivez-nous</p><h2 className="mt-2 font-serif text-2xl sm:text-3xl">Comment pouvons-nous vous aider ?</h2></div>
            {error && <p role="alert" className="mb-5 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="contact-name" className="block text-xs font-medium text-zinc-700">Votre nom<input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={120} className="mt-2 h-12 w-full border border-zinc-900/15 bg-white px-3 text-sm outline-none focus:border-zinc-500" placeholder="Nom et prénom" /></label>
                <label htmlFor="contact-email" className="block text-xs font-medium text-zinc-700">Votre e-mail<input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={255} className="mt-2 h-12 w-full border border-zinc-900/15 bg-white px-3 text-sm outline-none focus:border-zinc-500" placeholder="vous@exemple.com" /></label>
              </div>
              <label htmlFor="contact-subject" className="block text-xs font-medium text-zinc-700">Sujet<select id="contact-subject" name="subject" defaultValue="Question sur un produit" className="mt-2 h-12 w-full border border-zinc-900/15 bg-white px-3 text-sm outline-none focus:border-zinc-500"><option>Question sur un produit</option><option>Question sur une commande</option><option>Livraison et paiement</option><option>Autre demande</option></select></label>
              <label htmlFor="contact-message" className="block text-xs font-medium text-zinc-700">Votre message<textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={6} className="mt-2 block w-full resize-y border border-zinc-900/15 bg-white px-3 py-3 text-sm outline-none focus:border-zinc-500" placeholder="Décrivez-nous votre demande…" /></label>
              <button type="submit" disabled={status === "loading"} className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-zinc-950 px-5 text-xs font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-50 sm:w-auto sm:px-8">{status === "loading" ? "Envoi en cours…" : "Envoyer le message"}{status === "loading" ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <ArrowRight className="size-4 transition group-hover:translate-x-1" />}</button>
              <p className="flex items-start gap-2 text-[10px] leading-5 text-zinc-500"><MessageCircle className="mt-0.5 size-3.5 shrink-0" />Votre message est transmis de façon sécurisée et utilisé uniquement pour répondre à votre demande.</p>
            </form>
          </>}
        </section>
      </div>
      <section className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-zinc-900/10 pt-7 sm:flex-row sm:items-center"><div><p className="font-serif text-xl">Une question sur votre commande ?</p><p className="mt-1 text-sm text-zinc-500">Retrouvez ses informations et son statut depuis votre espace.</p></div><Link href="/account/orders" className="inline-flex items-center gap-2 border border-zinc-900/20 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition hover:bg-zinc-950 hover:text-white">Mes commandes <ArrowRight className="size-3.5" /></Link></section>
    </main>
  );
}
