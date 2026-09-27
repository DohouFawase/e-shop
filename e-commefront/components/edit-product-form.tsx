"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, FileImage, Plus, Save, X } from "lucide-react";

import { getImagePaths, getStorageUrl } from "@/lib/catalog";
import { updateProductSchema } from "@/schema/products/ProductSchema";
import { fetchCategories } from "@/store/categorySlice";
import { fetchProductById, updateProduct } from "@/store/productSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type ProductImageFile = { id: string; file: File; url: string };
type ProductFormState = {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  unit: string;
  stock: string;
  discountPrice: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};
const blank: ProductFormState = {
  name: "",
  description: "",
  categoryId: "",
  price: "",
  unit: "pièce",
  stock: "0",
  discountPrice: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};
const fieldClass =
  "h-[50px] w-full rounded-[9px] border border-[#e0e4e8] bg-[#f8f9fa] px-3 text-[14px] text-[#123b40] outline-none placeholder:text-[#536174] focus:border-[#aab9c0] focus:ring-2 focus:ring-[#e7edef]";
const labelClass =
  "mb-2 block text-[14px] font-medium leading-5 text-[#123b40]";
const sectionTitleClass =
  "mb-5 text-[22px] font-semibold leading-7 text-[#292e35]";
const formatCfa = (value: string) =>
  value
    ? new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
        Number(value),
      )
    : "";
const normalizeCfa = (value: string) => value.replace(/\D/g, "");
const toDateInput = (value?: string | null) =>
  value ? value.slice(0, 10) : "";
const toBoolean = (value: unknown) =>
  value === true || value === 1 || value === "1";

export function EditProductForm({ productId }: { productId: string }) {
  const [form, setForm] = useState<ProductFormState>(blank);
  const [files, setFiles] = useState<ProductImageFile[]>([]);
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const product = useAppSelector((state) => state.products.selected);
  const productStatus = useAppSelector((state) => state.products.status);
  const categories = useAppSelector((state) => state.categories.items);

  useEffect(() => {
    void dispatch(fetchProductById(productId));
    void dispatch(fetchCategories());
  }, [dispatch, productId]);

  useEffect(() => {
    if (!product || product.id !== productId) return;
    setForm({
      name: product.name,
      description: product.description ?? "",
      categoryId: product.category_id,
      price: String(product.price),
      unit: product.unit,
      stock: String(product.stock_quantity),
      discountPrice:
        product.discount_price == null ? "" : String(product.discount_price),
      startsAt: toDateInput(product.discount_starts_at),
      endsAt: toDateInput(product.discount_ends_at),
      isActive: toBoolean(product.is_active),
    });
  }, [product, productId]);

  const currentImages =
    product?.id === productId ? getImagePaths(product.images) : [];
  const currentImageUrl = getStorageUrl(currentImages[0]);

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const remaining = Math.max(0, 5 - files.length);
    const accepted = selected.slice(0, remaining).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setFiles((current) => [...current, ...accepted]);
    setErrors((errors) => ({
      ...errors,
      images:
        selected.length > remaining
          ? "Vous pouvez sélectionner 5 images au maximum."
          : "",
    }));
    event.target.value = "";
  }

  function removeSelectedImage(id: string) {
    setFiles((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((image) => image.id !== id);
    });
  }

  async function saveProduct() {
    setErrors({});
    setRequestError("");
    const result = updateProductSchema.safeParse({
      name: form.name,
      description: form.description.trim() || null,
      category_id: form.categoryId,
      price: form.price,
      unit: form.unit,
      stock_quantity: form.stock,
      discount_price: form.discountPrice === "" ? null : form.discountPrice,
      discount_starts_at: form.startsAt || null,
      discount_ends_at: form.endsAt || null,
      is_active: form.isActive,
      ...(files.length ? { images: files.map((image) => image.file) } : {}),
    });
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "form");
        nextErrors[field] ??= issue.message;
      }
      setErrors(nextErrors);
      const fieldLabels: Record<string, string> = {
        category_id: "Catégorie",
        name: "Nom",
        description: "Description",
        price: "Prix",
        unit: "Unitéé",
        stock_quantity: "Stock",
        images: "Images",
        discount_price: "Prix remisé",
        discount_starts_at: "Début de remise",
        discount_ends_at: "Fin de remise",
      };
      setRequestError(
        result.error.issues
          .map((issue) => `${fieldLabels[String(issue.path[0] ?? "")] ?? "Formulaire"} : ${issue.message}`)
          .join(" · "),
      );
      return;
    }
    setIsSaving(true);
    try {
      await dispatch(
        updateProduct({ id: productId, values: result.data }),
      ).unwrap();
      router.push("/dashboard/products");
    } catch (error) {
      setRequestError(
        typeof error === "string"
          ? error
          : "Impossible de modifier ce produit.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (productStatus === "loading" && (!product || product.id !== productId)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Chargement du produit…
      </div>
    );
  }
  if (!product || product.id !== productId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Produit introuvable ou inaccessible.
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void saveProduct();
      }}
      className="min-h-screen"
    >
      <header className="mb-1 flex min-h-16.5 flex-wrap items-center justify-between gap-3 px-0 py-2">
        <div>
          <Link
            href="/dashboard/products"
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-800"
          >
            <ArrowLeft className="size-4" /> Retour aux produits
          </Link>
          <h1 className="text-[20px] font-semibold leading-7 text-[#164b50]">
            Modifier le produit
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void saveProduct()}
          disabled={isSaving}
          className="inline-flex h-12 items-center gap-2 rounded-[7px] bg-[#697180] px-5 text-[14px] font-medium text-white hover:bg-[#586170] disabled:opacity-60"
        >
          <Save className="size-4" />
          {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </header>
      {requestError && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {requestError}
        </p>
      )}
      <main className="grid grid-cols-1 items-start gap-4 pb-5 lg:grid-cols-[1.26fr_1fr]">
        <section className="rounded-[9px] border border-[#e3e5e8] bg-white px-5 py-6 sm:px-6.5">
          <h2 className={sectionTitleClass}>Informations générales</h2>
          <div className="mb-7">
            <label className={labelClass} htmlFor="edit-product-name">
              Nom du produit
            </label>
            <input
              id="edit-product-name"
              maxLength={255}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={fieldClass}
            />
            {errors.name && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>
          <div className="mb-8">
            <label className={labelClass} htmlFor="edit-product-description">
              Description du produit
            </label>
            <textarea
              id="edit-product-description"
              rows={6}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className="min-h-39 w-full resize-y rounded-[9px] border border-[#e0e4e8] bg-[#f8f9fa] px-3 py-3 text-[14px] leading-5.75 text-[#123b40] outline-none focus:border-[#aab9c0]"
            />
            {errors.description && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.description}
              </p>
            )}
          </div>
          <h2 className={`${sectionTitleClass} mb-5`}>Prix</h2>
          <div className="mb-5">
            <label className={labelClass} htmlFor="edit-product-price">
              Prix du produit
            </label>
            <div className="relative">
              <input
                id="edit-product-price"
                type="text"
                inputMode="numeric"
                value={editingPrice ? form.price : formatCfa(form.price)}
                onFocus={() => setEditingPrice(true)}
                onBlur={() => {
                  setEditingPrice(false);
                  updateField(
                    "price",
                    form.price ? String(Number(form.price)) : "",
                  );
                }}
                onChange={(event) =>
                  updateField("price", normalizeCfa(event.target.value))
                }
                className={`${fieldClass} pr-16`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#687386]">
                FCFA
              </span>
            </div>
            {errors.price && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.price}
              </p>
            )}
          </div>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="edit-discount-price">
                Prix remisé
              </label>
              <div className="flex h-12.5 items-center gap-2 rounded-[9px] border border-[#e0e4e8] bg-[#f8f9fa] px-3">
                <span className="rounded bg-[#e7f4e6] px-2 py-1 text-[12px] font-medium">
                  FCFA
                </span>
                <input
                  id="edit-discount-price"
                  type="text"
                  inputMode="numeric"
                  value={
                    editingDiscount
                      ? form.discountPrice
                      : formatCfa(form.discountPrice)
                  }
                  onFocus={() => setEditingDiscount(true)}
                  onBlur={() => {
                    setEditingDiscount(false);
                    updateField(
                      "discountPrice",
                      form.discountPrice
                        ? String(Number(form.discountPrice))
                        : "",
                    );
                  }}
                  onChange={(event) =>
                    updateField(
                      "discountPrice",
                      normalizeCfa(event.target.value),
                    )
                  }
                  className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
                />
                <span className="whitespace-nowrap text-[14px]">
                  Prix remisé : {form.discountPrice || form.price ? `${formatCfa(form.discountPrice || form.price)} FCFA` : "—"}
                </span>
              </div>
              {errors.discount_price && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.discount_price}
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 self-end pb-3 text-sm text-[#687386]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
                className="size-4 accent-[#697180]"
              />
              Produit actif
            </label>
          </div>
          <h3 className={labelClass}>Période de la remise</h3>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                id: "edit-discount-start",
                key: "startsAt" as const,
                label: "Date de début",
                error: "discount_starts_at",
              },
              {
                id: "edit-discount-end",
                key: "endsAt" as const,
                label: "Date de fin",
                error: "discount_ends_at",
              },
            ].map((dateField) => (
              <div key={dateField.id}>
                <label className={labelClass} htmlFor={dateField.id}>
                  {dateField.label}
                </label>
                <div className="relative">
                  <input
                    id={dateField.id}
                    type="date"
                    value={form[dateField.key]}
                    min={
                      dateField.key === "endsAt"
                        ? form.startsAt || undefined
                        : undefined
                    }
                    max={
                      dateField.key === "startsAt"
                        ? form.endsAt || undefined
                        : undefined
                    }
                    onChange={(event) =>
                      updateField(dateField.key, event.target.value)
                    }
                    className={`${fieldClass} pr-10`}
                  />
                  <CalendarDays className="pointer-events-none absolute right-3 top-1/2 size-4.5 -translate-y-1/2 text-[#123b40]" />
                </div>
                {errors[dateField.error] && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {errors[dateField.error]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <h2 className={`${sectionTitleClass} mb-5`}>Stock</h2>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="edit-product-stock">
                Quantité en stock
              </label>
              <input
                id="edit-product-stock"
                type="number"
                min="0"
                step="1"
                disabled={Number(form.stock) === 0}
                value={Number(form.stock) === 0 ? "" : form.stock}
                placeholder={Number(form.stock) === 0 ? "Illimité" : "Ex. : 10"}
                onChange={(event) => updateField("stock", event.target.value)}
                className={`${fieldClass} disabled:opacity-100`}
              />
              {errors.stock_quantity && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.stock_quantity}
                </p>
              )}
              <label className="mt-2 flex items-center gap-3 text-[14px]">
                <button
                  type="button"
                  role="switch"
                  aria-checked={Number(form.stock) === 0}
                  onClick={() => updateField("stock", Number(form.stock) === 0 ? "1" : "0")}
                  className={`relative h-[24px] w-[48px] rounded-full transition-colors ${Number(form.stock) === 0 ? "bg-[#e4e5e5]" : "bg-[#aab5b8]"}`}
                >
                  <span className={`absolute top-[3px] size-[18px] rounded-full bg-[#e8f6e6] transition-all ${Number(form.stock) === 0 ? "right-[4px]" : "left-[4px]"}`} />
                </button>
                Stock illimité
              </label>
            </div>
            <div>
              <label className={labelClass} htmlFor="edit-product-unit">
                Unité
              </label>
              <input
                id="edit-product-unit"
                value={form.unit}
                onChange={(event) => updateField("unit", event.target.value)}
                className={fieldClass}
              />
              {errors.unit && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.unit}
                </p>
              )}
            </div>
          </div>
        </section>
        <section className="rounded-[9px] border border-[#e3e5e8] bg-white px-5 py-6 sm:px-[25px]">
          
          <h2 className={sectionTitleClass}>Images du produit</h2>
          <label className={labelClass}>Image du produit</label>
          <div className="relative flex h-[266px] items-center justify-center rounded-[9px] border border-[#e0e4e8] bg-white">
            {files[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={files[0].url} alt={files[0].file.name} className="max-h-[210px] max-w-[70%] object-contain" />
            ) : currentImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentImageUrl} alt="Image actuelle du produit" className="max-h-[210px] max-w-[70%] object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400"><FileImage className="size-10" /><span className="text-sm">Aucune image sélectionnée</span></div>
            )}
            <button type="button" onClick={() => fileInput.current?.click()} className="absolute bottom-[9px] left-[11px] flex h-[38px] items-center gap-2 rounded-[8px] border border-[#e1e5e9] bg-white px-3 text-[14px] text-[#687386]"><FileImage className="size-4" />Parcourir</button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {(files.length ? files.slice(0, 2).map((image) => ({ id: image.id, url: image.url, name: image.file.name, removable: true })) : currentImages.slice(0, 2).map((path) => ({ id: path, url: getStorageUrl(path), name: "Image actuelle", removable: false }))).map((image) => (
              <div key={image.id} className="relative flex h-[100px] items-center justify-center overflow-hidden rounded-[9px] border border-[#e0e4e8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {image.url && <img src={image.url} alt={image.name} className="h-full w-full object-contain p-2" />}
                {image.removable && <button type="button" aria-label={`Supprimer ${image.name}`} onClick={() => removeSelectedImage(image.id)} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full border border-[#687386] bg-white"><X className="size-3" /></button>}
              </div>
            ))}
            <button type="button" onClick={() => fileInput.current?.click()} className="flex h-[100px] flex-col items-center justify-center gap-1 rounded-[9px] border border-dashed border-[#aab8c6] text-[#37a368]"><span className="grid size-5 place-items-center rounded-full bg-[#687386] text-white"><Plus className="size-3" /></span><span className="text-[14px]">Ajouter une image</span></button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            onChange={selectFiles}
            className="sr-only"
          />
          {files.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Les images actuelles seront remplacées par cette sélection à l’enregistrement.
            </p>
          )}
          {errors.images && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.images}
            </p>
          )}

          <h2 className={`${sectionTitleClass} mb-5 mt-8`}>Catégories</h2>
          <div className="mb-5">
            <label className={labelClass} htmlFor="edit-product-category">
              Catégorie du produit
            </label>
            <select
              id="edit-product-category"
              value={form.categoryId}
              onChange={(event) =>
                updateField("categoryId", event.target.value)
              }
              className={`${fieldClass} bg-white`}
            >
              <option value="">Choisir une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.category_id}
              </p>
            )}
          </div>


          <div className="mt-8 flex justify-end gap-3">
            <Link
              href="/dashboard/products"
              className="rounded-[8px] border border-[#e0e4e8] bg-white px-4 py-2.5 text-sm font-medium text-[#153e43] hover:bg-slate-50"
            >
              Annuler
            </Link>
            <button
              type="button"
              onClick={() => void saveProduct()}
              disabled={isSaving}
              className="rounded-[8px] bg-[#697180] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#586170] disabled:opacity-60"
            >
              {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </div>
        </section>
      </main>
    </form>
  );
}

export default EditProductForm;
