"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, Mail, MapPin, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changePassword, fetchProfile, updateProfile } from "@/store/profileSlice";

const fieldClass = "mt-2 block h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10";
const labelClass = "block text-sm font-medium text-slate-700";

export function AdminProfileForm() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const profile = useAppSelector((state) => state.profile.profile);
  const status = useAppSelector((state) => state.profile.status);
  const error = useAppSelector((state) => state.profile.error);
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "Africa/Abidjan");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) return;
    void dispatch(fetchProfile()).unwrap().then((loaded) => {
      setFirstName(loaded.first_name ?? "");
      setLastName(loaded.last_name ?? "");
      setPhone(loaded.phone ?? "");
      setLocation(loaded.location ?? "");
      setTimezone(loaded.timezone ?? "Africa/Abidjan");
    }).catch(() => {
      // L’erreur est affichée depuis Redux.
    });
  }, [dispatch, profile]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await dispatch(updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
        timezone,
      })).unwrap();
      toast.success("Votre profil a été mis à jour.");
    } catch {
      // L’erreur Redux est affichée dans la page.
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await dispatch(changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      })).unwrap();
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      toast.success("Votre mot de passe a été modifié.");
    } catch {
      // L’erreur Redux est affichée dans la page.
    }
  }

  const email = profile?.email ?? authUser?.email ?? "";
  const loading = !profile && status === "loading";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-[#123b40] via-[#17645e] to-[#27816d] px-6 py-7 text-white shadow-sm sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-100">Espace administrateur</p>
        <h2 className="mt-2 text-2xl font-semibold">Mon profil</h2>
        <p className="mt-2 text-sm text-teal-50/90">Gérez vos coordonnées et la sécurité de votre compte.</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {loading ? (
        <div className="space-y-4"><div className="h-64 animate-pulse rounded-2xl bg-white" /><div className="h-64 animate-pulse rounded-2xl bg-white" /></div>
      ) : (
        <>
          <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
              <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-800"><UserRound className="size-5" /></span>
              <div><h3 className="font-semibold text-slate-900">Informations personnelles</h3><p className="mt-1 text-sm text-slate-500">Ces informations sont associées à votre compte administrateur.</p></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>Prénom<input required autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Nom<input required autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Adresse e-mail<div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input type="email" value={email} readOnly className={`${fieldClass} cursor-not-allowed bg-slate-50 pl-10`} /></div></label>
              <label className={labelClass}>Téléphone<input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Votre numéro de téléphone" className={fieldClass} /></label>
              <label className={labelClass}>Fuseau horaire<input required value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Africa/Abidjan" className={fieldClass} /><span className="mt-1 block text-xs font-normal text-slate-500">Fuseau IANA détecté à l’inscription; modifiable ici (ex. Europe/Paris).</span></label>
              <label className={labelClass}>Adresse habituelle<div className="relative"><MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input autoComplete="street-address" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ville, quartier, adresse" className={`${fieldClass} pl-10`} /></div></label>
            </div>
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-5"><button disabled={savingProfile || status === "loading"} className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-800 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-wait disabled:opacity-50">{savingProfile ? "Enregistrement…" : "Enregistrer les modifications"}<ArrowRight className="size-4" /></button></div>
          </form>

          <form onSubmit={savePassword} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-800"><LockKeyhole className="size-5" /></span>
              <div><h3 className="font-semibold text-slate-900">Sécurité du compte</h3><p className="mt-1 text-sm text-slate-500">Utilisez un mot de passe d’au moins 8 caractères, avec lettres et chiffres.</p></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>Mot de passe actuel<input required autoComplete="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Nouveau mot de passe<input required autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Confirmer le nouveau mot de passe<input required autoComplete="new-password" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} className={fieldClass} /></label>
            </div>
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-5"><button disabled={status === "loading"} className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-900 hover:text-white disabled:cursor-wait disabled:opacity-50">{status === "loading" ? "Mise à jour…" : "Modifier le mot de passe"}<ArrowRight className="size-4" /></button></div>
          </form>
        </>
      )}
    </div>
  );
}
