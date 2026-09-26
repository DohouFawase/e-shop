"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, MapPin, Package, ShieldCheck, UserRound } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changePassword, fetchProfile, updateProfile } from "@/store/profileSlice";
import type { Profile } from "@/types/shop";

const inputClass = "mt-2 block h-12 w-full border border-zinc-900/15 bg-white px-3 text-sm font-normal text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500";
const labelClass = "block text-xs font-medium text-zinc-700";

export default function AccountPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const profile = useAppSelector((state) => state.profile.profile);
  const status = useAppSelector((state) => state.profile.status);
  const error = useAppSelector((state) => state.profile.error);
  const message = useAppSelector((state) => state.profile.message);

  useEffect(() => {
    if (user) void dispatch(fetchProfile());
  }, [dispatch, user]);

  if (!user) {
    return (
      <main id="main-content" className="site-container min-h-[60vh] py-20">
        <nav aria-label="Fil d’Ariane" className="mb-8 text-xs text-zinc-500"><Link href="/" className="hover:text-zinc-950">Accueil</Link><span className="mx-2">/</span><span className="text-zinc-900">Mon compte</span></nav>
        <div className="mx-auto max-w-xl border-y border-zinc-900/10 py-14 text-center">
          <UserRound className="mx-auto size-8 text-zinc-400" />
          <h1 className="mt-5 font-serif text-3xl">Votre espace personnel</h1>
          <p className="mt-3 text-sm text-zinc-600">Connectez-vous pour gérer votre profil, vos commandes et vos informations.</p>
          <Link href="/auth" className="mt-7 inline-flex h-11 items-center gap-2 bg-zinc-950 px-6 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-700">Se connecter <ArrowRight className="size-4" /></Link>
        </div>
      </main>
    );
  }

  const firstName = profile?.first_name ?? user.first_name ?? "";
  const lastName = profile?.last_name ?? user.last_name ?? "";
  const initials = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();

  return (
    <main id="main-content" className="site-container min-h-[60vh] pb-20 pt-8 sm:pt-10">
      <nav aria-label="Fil d’Ariane" className="mb-8 text-xs text-zinc-500"><Link href="/" className="hover:text-zinc-950">Accueil</Link><span className="mx-2">/</span><span className="text-zinc-900">Mon compte</span></nav>

      <header className="relative mb-8 overflow-hidden bg-[#f4f1ec] px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white font-serif text-xl text-zinc-700 sm:size-16">{initials || <UserRound className="size-6" />}</span>
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Votre espace personnel</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl">Bonjour{firstName ? `, ${firstName}` : ""}</h1><p className="mt-2 text-sm text-zinc-600">Gérez vos informations et vos préférences de compte.</p></div>
          </div>
          <Link href="/account/orders" className="inline-flex h-11 items-center gap-2 border border-zinc-900/20 bg-white/70 px-4 text-xs font-semibold uppercase tracking-wide text-zinc-800 transition hover:bg-white"><Package className="size-4" /> Mes commandes <ArrowRight className="size-3.5" /></Link>
        </div>
      </header>

      {error && <p role="alert" className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {message && <p role="status" className="mb-5 flex items-center gap-2 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><Check className="size-4 shrink-0" />{message}</p>}

      {!profile ? (
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]"><div className="h-52 animate-pulse bg-zinc-100" /><div className="h-80 animate-pulse bg-zinc-100" /></div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[0.7fr_1.3fr] xl:gap-10">
          <aside className="space-y-4">
            <section className="border border-zinc-900/10 p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Compte</p>
              <p className="mt-3 break-all text-sm font-medium text-zinc-900">{profile.email}</p>
              <p className="mt-1 text-xs text-zinc-500">Adresse e-mail associée à votre compte</p>
              <div className="mt-5 flex items-start gap-3 border-t border-zinc-900/10 pt-4"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-zinc-500" /><p className="text-xs leading-5 text-zinc-600">Vos informations servent à préparer et suivre vos commandes.</p></div>
            </section>
            <Link href="/favorites" className="flex items-center justify-between border border-zinc-900/10 p-5 text-sm transition hover:bg-zinc-50"><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#f4f1ec]"><UserRound className="size-4 text-zinc-600" /></span>Ma sélection de favoris</span><ArrowRight className="size-4 text-zinc-500" /></Link>
            <Link href="/account/orders" className="flex items-center justify-between border border-zinc-900/10 p-5 text-sm transition hover:bg-zinc-50"><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#f4f1ec]"><Package className="size-4 text-zinc-600" /></span>Historique des commandes</span><ArrowRight className="size-4 text-zinc-500" /></Link>
          </aside>

          <div className="space-y-6">
            <ProfileForm key={profile.id} profile={profile} status={status} />
          </div>
        </div>
      )}
    </main>
  );
}

function ProfileForm({ profile, status }: { profile: Profile; status: "idle" | "loading" | "succeeded" | "failed" }) {
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [timezone, setTimezone] = useState(profile.timezone ?? "Africa/Abidjan");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void dispatch(updateProfile({ first_name: firstName, last_name: lastName, phone, location, timezone }));
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await dispatch(changePassword({ current_password: currentPassword, password, password_confirmation: passwordConfirmation })).unwrap();
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch {
      // L’erreur du service est rendue dans le bandeau du compte.
    }
  }

  return <>
    <form onSubmit={saveProfile} className="border border-zinc-900/10 bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-zinc-900/10 pb-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Vos coordonnées</p><h2 className="mt-2 font-serif text-2xl">Informations personnelles</h2></div><UserRound className="size-5 text-zinc-400" /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>Prénom<input required autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Nom<input required autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Téléphone<input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Votre numéro de téléphone" className={inputClass} /></label>
        <label className={labelClass}>Fuseau horaire<input required value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Africa/Abidjan" className={inputClass} /><span className="mt-1 block text-[11px] font-normal text-zinc-500">Fuseau IANA; modifiable si nécessaire (ex. Europe/Paris).</span></label>
        <label className={labelClass}>Adresse habituelle<input autoComplete="street-address" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ville, quartier, adresse" className={inputClass} /></label>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900/10 pt-5"><p className="flex items-center gap-2 text-xs text-zinc-500"><MapPin className="size-3.5" /> Ces informations facilitent vos prochaines commandes.</p><button disabled={status === "loading"} className="inline-flex h-11 items-center gap-2 bg-zinc-950 px-5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-50">{status === "loading" ? "Enregistrement…" : "Enregistrer les modifications"}<ArrowRight className="size-3.5" /></button></div>
    </form>

    <form onSubmit={savePassword} className="border border-zinc-900/10 bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-zinc-900/10 pb-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Sécurité</p><h2 className="mt-2 font-serif text-2xl">Changer le mot de passe</h2><p className="mt-2 text-xs leading-5 text-zinc-500">Choisissez un mot de passe que vous n’utilisez pas ailleurs.</p></div><LockKeyhole className="size-5 text-zinc-400" /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2`}>Mot de passe actuel<input required autoComplete="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Nouveau mot de passe<input required autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Confirmer le nouveau mot de passe<input required autoComplete="new-password" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} className={inputClass} /></label>
      </div>
      <div className="mt-6 flex justify-end border-t border-zinc-900/10 pt-5"><button disabled={status === "loading"} className="inline-flex h-11 items-center gap-2 border border-zinc-900/20 px-5 text-xs font-semibold uppercase tracking-wider text-zinc-800 transition hover:bg-zinc-950 hover:text-white disabled:cursor-wait disabled:opacity-50">{status === "loading" ? "Mise à jour…" : "Mettre à jour le mot de passe"}<ArrowRight className="size-3.5" /></button></div>
    </form>
  </>;
}
