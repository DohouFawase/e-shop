"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProductSchema } from "@/schema/products/ProductSchema";
import { fetchCategories } from "@/store/categorySlice";
import { createProduct } from "@/store/productSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CalendarDays, ChevronDown, FileImage, Plus, X } from "lucide-react";

type ProductImage = { id: number; url: string; name: string; file: File };

const fieldClass =
  "h-[50px] w-full rounded-[9px] border border-[#e0e4e8] bg-[#f8f9fa] px-3 text-[14px] text-[#123b40] outline-none placeholder:text-[#536174] focus:border-[#aab9c0] focus:ring-2 focus:ring-[#e7edef]";
const labelClass =
  "mb-2 block text-[14px] font-medium leading-5 text-[#123b40]";
const sectionTitleClass =
  "mb-5 text-[22px] font-semibold leading-7 text-[#292e35]";

const formatCfa = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);

const formatCfaInput = (value: string) => {
  if (!value) return "";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
        amount,
      )
    : value;
};

const normalizeCfaInput = (value: string) => value.replace(/\D/g, "");

export function NewProductForm() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [unlimited, setUnlimited] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [unit, setUnit] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [discountStartsAt, setDiscountStartsAt] = useState("");
  const [discountEndsAt, setDiscountEndsAt] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const categories = useAppSelector((state) => state.categories.items);
  const categoryStatus = useAppSelector((state) => state.categories.status);
  const fileInput = useRef<HTMLInputElement>(null);
  const salePrice = discount ? Number(discount) : Number(price || 0);

  useEffect(() => {
    if (categoryStatus === "idle") void dispatch(fetchCategories());
  }, [categoryStatus, dispatch]);

  async function submitProduct() {
    setSubmitError("");
    setFieldErrors({});

    const parsed = createProductSchema.safeParse({
      category_id: categoryId,
      name: productName,
      description,
      price,
      unit,
      stock_quantity: unlimited ? 0 : stockQuantity,
      images: images.map((image) => image.file),
      discount_price: discount === "" ? null : discount,
      discount_starts_at: discountStartsAt || null,
      discount_ends_at: discountEndsAt || null,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        errors[key] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createProduct(parsed.data)).unwrap();
      router.push("/dashboard/products");
    } catch (error) {
      setSubmitError(
        typeof error === "string" ? error : "Impossible de créer le produit.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function addImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const next = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));
    setImages((current) => [...current, ...next]);
    event.target.value = "";
  }

  function removeImage(id: number) {
    setImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((image) => image.id !== id);
    });
  }

  return (
    <form
      className="min-h-screen"
      onSubmit={(event) => {
        event.preventDefault();
        void submitProduct();
      }}
    >
      <header className="flex min-h-16.5 flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6.75">
        <h1 className="text-[20px] font-semibold leading-7 text-[#164b50]">
          Ajouter un produit{" "}
        </h1>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-[7px] bg-[#697180] px-5 text-[14px] font-medium text-white hover:bg-[#5e6674] disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "Création en cours…" : "Créer le produit"}
        </button>
      </header>

      {submitError && (
        <p
          role="alert"
          className="mx-4 mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:mx-7"
        >
          {submitError}
        </p>
      )}
      <main className="grid grid-cols-1 items-start gap-4 px-0 pb-5 lg:grid-cols-[1.26fr_1fr]">
        <section className="rounded-[9px] border border-[#e3e5e8] bg-white px-5 py-6 sm:px-6.5">
          <h2 className={sectionTitleClass}>Informations générales</h2>

          <div className="mb-7">
            <label className={labelClass} htmlFor="product-name">
              Nom du produit
            </label>
            <input
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={fieldClass}
            />
            {fieldErrors.name && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="mb-8">
            <label className={labelClass} htmlFor="product-description">
              Description du produit
            </label>
            <div className="relative">
              <textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-39 w-full resize-y rounded-[9px] border border-[#e0e4e8] bg-[#f8f9fa] px-3 py-3 text-[14px] leading-5.75 text-[#123b40] outline-none focus:border-[#aab9c0]"
              />
            </div>
            {fieldErrors.description && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <h2 className={`${sectionTitleClass} mb-5`}>Prix</h2>
          <div className="mb-5">
            <label className={labelClass} htmlFor="product-price">
              Prix du produit
            </label>
            <div className="relative">
              <input
                id="product-price"
                type="text"
                inputMode="numeric"
                value={editingPrice ? price : formatCfaInput(price)}
                onFocus={() => setEditingPrice(true)}
                onBlur={() => {
                  setEditingPrice(false);
                  setPrice((value) => (value ? String(Number(value)) : ""));
                }}
                onChange={(event) =>
                  setPrice(normalizeCfaInput(event.target.value))
                }
                className={`${fieldClass} pr-16`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#687386]">
                FCFA
              </span>
            </div>
            {fieldErrors.price && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {fieldErrors.price}
              </p>
            )}
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="discount-price">
                Prix remisé{" "}
                <span className="font-normal text-[#687386]">(facultatif)</span>
              </label>
              <div className="flex h-12.5 items-center gap-2 rounded-[9px] border border-[#e0e4e8] bg-[#f8f9fa] px-3">
                <span className="rounded bg-[#e7f4e6] px-2 py-1 text-[12px] font-medium">
                  FCFA
                </span>
                <input
                  id="discount-price"
                  type="text"
                  inputMode="numeric"
                  value={editingDiscount ? discount : formatCfaInput(discount)}
                  onFocus={() => setEditingDiscount(true)}
                  onBlur={() => {
                    setEditingDiscount(false);
                    setDiscount((value) =>
                      value ? String(Number(value)) : "",
                    );
                  }}
                  onChange={(event) =>
                    setDiscount(normalizeCfaInput(event.target.value))
                  }
                  className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
                />
                <span className="whitespace-nowrap text-[14px]">
                  Prix remisé : {discount || price ? formatCfa(salePrice) : "—"}
                </span>
              </div>
              {fieldErrors.discount_price && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.discount_price}
                </p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className={labelClass}>Période de la remise</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="discount-starts-at">
                  Date de début
                </label>
                <div className="relative">
                  <input
                    id="discount-starts-at"
                    type="date"
                    value={discountStartsAt}
                    max={discountEndsAt || undefined}
                    aria-invalid={Boolean(fieldErrors.discount_starts_at)}
                    onChange={(event) =>
                      setDiscountStartsAt(event.target.value)
                    }
                    className={`${fieldClass} pr-10`}
                  />
                  <CalendarDays
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 size-4.5 -translate-y-1/2 text-[#123b40]"
                  />
                </div>
                {fieldErrors.discount_starts_at && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.discount_starts_at}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass} htmlFor="discount-ends-at">
                  Date de fin
                </label>
                <div className="relative">
                  <input
                    id="discount-ends-at"
                    type="date"
                    value={discountEndsAt}
                    min={discountStartsAt || undefined}
                    aria-invalid={Boolean(fieldErrors.discount_ends_at)}
                    onChange={(event) => setDiscountEndsAt(event.target.value)}
                    className={`${fieldClass} pr-10`}
                  />
                  <CalendarDays
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 size-4.5 -translate-y-1/2 text-[#123b40]"
                  />
                </div>
                {fieldErrors.discount_ends_at && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.discount_ends_at}
                  </p>
                )}
              </div>
            </div>
          </div>

          <h2 className={`${sectionTitleClass} mb-5`}>Stock</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="stock-quantity">
                Quantité en stock
              </label>
              <input
                id="stock-quantity"
                type="number"
                min="0"
                step="1"
                disabled={unlimited}
                value={unlimited ? "" : stockQuantity}
                onChange={(event) => setStockQuantity(event.target.value)}
                placeholder={unlimited ? "Illimité" : "Ex. : 10"}
                className={`${fieldClass} disabled:opacity-100`}
              />
              {fieldErrors.stock_quantity && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.stock_quantity}
                </p>
              )}
              <label className="mt-2 flex items-center gap-3 text-[14px]">
                <button
                  type="button"
                  role="switch"
                  aria-checked={unlimited}
                  onClick={() => setUnlimited((value) => !value)}
                  className={`relative h-[24px] w-[48px] rounded-full transition-colors ${unlimited ? "bg-[#e4e5e5]" : "bg-[#aab5b8]"}`}
                >
                  <span
                    className={`absolute top-[3px] size-[18px] rounded-full bg-[#e8f6e6] transition-all ${unlimited ? "right-[4px]" : "left-[4px]"}`}
                  />
                </button>
                Stock illimité
              </label>
            </div>
            <div>
              <label className={labelClass} htmlFor="product-unit">
                Unité
              </label>
              <input
                id="product-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className={fieldClass}
              />
              {fieldErrors.unit && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.unit}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[38px] rounded-[8px] bg-[#697180] px-4 text-[14px] font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? "Création en cours…" : "Créer le produit"}
            </button>
          </div>
        </section>

        <section className="rounded-[9px] border border-[#e3e5e8] bg-white px-5 py-6 sm:px-[25px]">
          <h2 className={sectionTitleClass}>Images du produit</h2>
          <label className={labelClass}>Image du produit</label>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            onChange={addImages}
            className="sr-only"
          />
          <div className="relative flex h-[266px] items-center justify-center rounded-[9px] border border-[#e0e4e8] bg-white">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[0].url}
                alt={images[0].name}
                className="max-h-[210px] max-w-[70%] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <FileImage className="size-10" />
                <span className="text-sm">Aucune image sélectionnée</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="absolute bottom-[9px] left-[11px] flex h-[38px] items-center gap-2 rounded-[8px] border border-[#e1e5e9] bg-white px-3 text-[14px] text-[#687386]"
            >
              <FileImage className="size-4" />
              Parcourir
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {images.slice(0, 2).map((image) => (
              <div
                key={image.id}
                className="relative flex h-[100px] items-center justify-center overflow-hidden rounded-[9px] border border-[#e0e4e8]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full object-contain p-2"
                />
                <button
                  type="button"
                  aria-label={`Supprimer ${image.name}`}
                  onClick={() => removeImage(image.id)}
                  className="absolute right-1 top-1 grid size-4 place-items-center rounded-full border border-[#687386] bg-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex h-[100px] flex-col items-center justify-center gap-1 rounded-[9px] border border-dashed border-[#aab8c6] text-[#37a368]"
            >
              <span className="grid size-5 place-items-center rounded-full bg-[#687386] text-white">
                <Plus className="size-3" />
              </span>
              <span className="text-[14px]">Ajouter une image</span>
            </button>
          </div>
          {fieldErrors.images && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {fieldErrors.images}
            </p>
          )}

          <h2 className={`${sectionTitleClass} mb-5 mt-8`}>Catégories</h2>
          <div className="mb-5">
            <label className={labelClass} htmlFor="product-category">
              Catégorie du produit
            </label>
            <div className="relative">
              <select
                id="product-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={`${fieldClass} appearance-none bg-white pr-9 shadow-sm`}
              >
                <option value="">Choisir une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-black" />
            </div>
            {fieldErrors.category_id && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {fieldErrors.category_id}
              </p>
            )}
            {categoryStatus === "loading" && (
              <p className="mt-1 text-xs text-slate-500">
                Chargement des catégories…
              </p>
            )}
          </div>
        </section>
      </main>
    </form>
  );
}

export default NewProductForm;
