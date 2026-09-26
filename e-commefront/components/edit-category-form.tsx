"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Save, X } from "lucide-react";

import { getStorageUrl } from "@/lib/catalog";
import { updateCategorySchema } from "@/schema/categories/CategorySchema";
import { fetchCategoryById, updateCategory } from "@/store/categorySlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";

export function EditCategoryForm({ categoryId }: { categoryId: string }) {
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
  const category = useAppSelector((state) => state.categories.selected);
  const status = useAppSelector((state) => state.categories.status);
  const loadError = useAppSelector((state) => state.categories.error);

  useEffect(() => {
    void dispatch(fetchCategoryById(categoryId));
  }, [categoryId, dispatch]);

  useEffect(() => {
    if (!category || category.id !== categoryId) return;
    setName(category.name);
    setDescription(category.description ?? "");
  }, [category, categoryId]);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const existingImage = category?.id === categoryId ? getStorageUrl(category.image) : null;

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    setImage(event.target.files?.[0] ?? null);
    setErrors((current) => ({ ...current, image: "" }));
    event.target.value = "";
  }

  async function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setRequestError("");
    const result = updateCategorySchema.safeParse({
      name,
      description: description.trim() || null,
      ...(image ? { image } : {}),
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
      await dispatch(updateCategory({ id: categoryId, values: result.data })).unwrap();
      router.push("/dashboard/categories");
    } catch (error) {
      setRequestError(typeof error === "string" ? error : "Impossible de modifier la catégorie.");
    } finally {
      setIsSaving(false);
    }
  }

  if (status === "loading" && (!category || category.id !== categoryId)) {
    return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Chargement de la catégorie…</div>;
  }
  if ((!category || category.id !== categoryId) && status === "failed") {
    return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError || "Catégorie introuvable."}</p>;
  }

  return (
    <form onSubmit={saveChanges} className="mx-auto min-h-screen max-w-6xl">
      <header className="mb-6 flex min-h-[66px] flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/categories" className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-800"><ArrowLeft className="size-4" /> Retour aux catégories</Link>
          <h1 className="text-[20px] font-semibold leading-7 text-[#164b50]">Modifier la catégorie</h1>
          <p className="mt-1 text-sm text-slate-500">Mets à jour son nom, sa description ou son image.</p>
        </div>
        <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#697180] px-5 text-sm font-medium text-white transition hover:bg-[#586170] disabled:cursor-wait disabled:opacity-60"><Save className="size-4" />{isSaving ? "Enregistrement…" : "Enregistrer"}</button>
      </header>
      {requestError && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{requestError}</p>}
      <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[9px] border border-[#e3e5e8] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-6 text-[22px] font-semibold leading-7 text-[#292e35]">Informations de la catégorie</h2>
          <div className="mb-6">
            <label htmlFor="category-name" className={labelClass}>Nom de la catégorie <span className="text-red-600">*</span></label>
            <input id="category-name" maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} aria-invalid={Boolean(errors.name)} />
            {errors.name && <p role="alert" className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="category-description" className={labelClass}>Description <span className="font-normal text-slate-400">(facultative)</span></label>
            <textarea id="category-description" rows={7} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClass} resize-y leading-6`} />
          </div>
        </section>
        <section className="rounded-[9px] border border-[#e3e5e8] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-[22px] font-semibold leading-7 text-[#292e35]">Image de couverture</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500">Image facultative, 2 Mo maximum. Laisse vide pour conserver l’image actuelle.</p>
          <input ref={fileInput} type="file" accept="image/*" onChange={selectImage} className="sr-only" />
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
            {(previewUrl || existingImage) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl || existingImage || ""} alt="Aperçu de la catégorie" className="h-full w-full object-cover" />
            ) : <div className="flex flex-col items-center gap-3 px-6 text-center text-slate-400"><ImagePlus className="size-10" strokeWidth={1.4} /><span className="text-sm">Aucune image</span></div>}
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => fileInput.current?.click()} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">{image ? "Remplacer l’image" : "Choisir une image"}</button>
            {image && <button type="button" onClick={() => setImage(null)} aria-label="Retirer la nouvelle image" className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><X className="size-4" /></button>}
          </div>
          {errors.image && <p role="alert" className="mt-2 text-sm text-red-600">{errors.image}</p>}
        </section>
      </div>
      <footer className="mt-6 flex justify-end gap-3">
        <Link href="/dashboard/categories" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Annuler</Link>
        <button type="submit" disabled={isSaving} className="rounded-lg bg-[#697180] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#586170] disabled:opacity-60">{isSaving ? "Enregistrement…" : "Enregistrer les modifications"}</button>
      </footer>
    </form>
  );
}

export default EditCategoryForm;
