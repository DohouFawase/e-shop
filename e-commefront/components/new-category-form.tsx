"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Save, X } from "lucide-react";
import Link from "next/link";

import { createCategorySchema } from "@/schema/categories/CategorySchema";
import { createCategory } from "@/store/categorySlice";
import { useAppDispatch } from "@/store/hooks";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";

export function NewCategoryForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImage(file);
    setErrors((current) => ({ ...current, image: "" }));
    event.target.value = "";
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestError("");
    setErrors({});

    const result = createCategorySchema.safeParse({
      name,
      description: description.trim() || null,
      image,
    });

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "form");
        nextErrors[field] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(createCategory(result.data)).unwrap();
      router.push("/dashboard/categories");
    } catch (error) {
      setRequestError(
        typeof error === "string" ? error : "Impossible de créer la catégorie.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={saveCategory} className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/categories" className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-800">
            <ArrowLeft className="size-4" /> Retour aux catégories
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">Ajouter une catégorie</h1>
          <p className="mt-1 text-sm text-slate-500">Organise les produits de ta boutique.</p>
        </div>
        <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#697180] px-5 text-sm font-medium text-white transition hover:bg-[#586170] disabled:cursor-wait disabled:opacity-60">
          <Save className="size-4" /> {isSaving ? "Enregistrement…" : "Enregistrer la catégorie"}
        </button>
      </header>

      {requestError && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{requestError}</p>}

      <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Informations de la catégorie</h2>
          <div className="mb-6">
            <label htmlFor="category-name" className={labelClass}>Nom de la catégorie <span className="text-red-600">*</span></label>
            <input id="category-name" autoFocus maxLength={255} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Électronique" className={inputClass} aria-invalid={Boolean(errors.name)} />
            {errors.name && <p role="alert" className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="category-description" className={labelClass}>Description <span className="font-normal text-slate-400">(facultative)</span></label>
            <textarea id="category-description" rows={7} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Décris les produits qui appartiennent à cette catégorie…" className={`${inputClass} resize-y leading-6`} />
            <p className="mt-2 text-right text-xs text-slate-400">{description.length}/2000</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">Image de couverture</h2>
          <p className="mb-5 text-sm text-slate-500">Image facultative, 2 Mo maximum.</p>
          <input ref={fileInput} type="file" accept="image/*" onChange={selectImage} className="sr-only" />
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Aperçu de la catégorie" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 text-center text-slate-400">
                <ImagePlus className="size-10" strokeWidth={1.4} />
                <span className="text-sm">Ajoute une image pour illustrer la catégorie</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => fileInput.current?.click()} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {image ? "Remplacer l’image" : "Choisir une image"}
            </button>
            {image && <button type="button" onClick={() => setImage(null)} aria-label="Retirer l’image" className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><X className="size-4" /></button>}
          </div>
          {errors.image && <p role="alert" className="mt-2 text-sm text-red-600">{errors.image}</p>}
          {image && <p className="mt-2 truncate text-xs text-slate-500">{image.name} · {(image.size / 1024 / 1024).toFixed(2)} Mo</p>}
        </section>
      </div>

      <footer className="mt-6 flex justify-end gap-3">
        <Link href="/dashboard/categories" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Annuler</Link>
        <button type="submit" disabled={isSaving} className="rounded-lg bg-[#697180] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#586170] disabled:opacity-60">{isSaving ? "Enregistrement…" : "Créer la catégorie"}</button>
      </footer>
    </form>
  );
}

export default NewCategoryForm;
