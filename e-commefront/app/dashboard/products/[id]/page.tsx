"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit3, Image as ImageIcon } from "lucide-react";

import { formatPrice, getImagePaths, getStorageUrl } from "@/lib/catalog";
import { fetchProductById } from "@/store/productSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => state.products.selected);
  const status = useAppSelector((state) => state.products.status);
  const error = useAppSelector((state) => state.products.error);

  useEffect(() => {
    void dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (status === "loading" && product?.id !== id) return <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Chargement du produit…</p>;
  if (!product || product.id !== id) return <div><Link href="/dashboard/products" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-800"><ArrowLeft className="size-4" /> Retour aux produits</Link><p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Produit introuvable."}</p></div>;

  const images = getImagePaths(product.images).map((path) => getStorageUrl(path)).filter((url): url is string => Boolean(url));
  const discount = product.discount_price != null;

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-800"><ArrowLeft className="size-4" /> Retour aux produits</Link>
        <Link href={`/dashboard/products/${encodeURIComponent(product.id)}/edit`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#697180] px-4 text-sm font-medium text-white hover:bg-[#586170]"><Edit3 className="size-4" /> Modifier</Link>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid min-h-72 grid-cols-2 gap-3">
            {images.length ? images.map((url, index) => <div key={`${url}-${index}`} className="flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={url} alt={`${product.name} — image ${index + 1}`} className="max-h-64 w-full object-contain" /></div>) : <div className="col-span-2 flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg bg-slate-50 text-slate-400"><ImageIcon className="size-10" /><span className="text-sm">Aucune image</span></div>}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{product.is_active ? "Actif" : "Inactif"}</span>{product.category && <Link href={`/dashboard/categories/${encodeURIComponent(product.category.id)}`} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 hover:bg-teal-100">{product.category.name}</Link>}</div>
          <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Unité : {product.unit} · Stock : {product.stock_quantity}</p>
          <div className="mt-5 flex items-baseline gap-3"><p className="text-xl font-semibold text-teal-900">{formatPrice(product.final_price ?? product.price)}</p>{discount && <p className="text-sm text-slate-400 line-through">{formatPrice(product.price)}</p>}</div>
          {product.description && <div className="mt-6 border-t border-slate-100 pt-5"><h2 className="mb-2 font-semibold text-slate-800">Description</h2><p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{product.description}</p></div>}
          {discount && <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Prix promotionnel : {formatPrice(product.discount_price)}</p>{(product.discount_starts_at || product.discount_ends_at) && <p className="mt-1">Période : {product.discount_starts_at ? new Date(product.discount_starts_at).toLocaleDateString("fr-FR") : "—"} → {product.discount_ends_at ? new Date(product.discount_ends_at).toLocaleDateString("fr-FR") : "—"}</p>}</div>}
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm"><div><dt className="text-slate-500">Créé le</dt><dd className="mt-1 font-medium text-slate-800">{new Date(product.created_at).toLocaleDateString("fr-FR", { dateStyle: "medium" })}</dd></div><div><dt className="text-slate-500">Mis à jour</dt><dd className="mt-1 font-medium text-slate-800">{new Date(product.updated_at).toLocaleDateString("fr-FR", { dateStyle: "medium" })}</dd></div></dl>
        </section>
      </div>
    </section>
  );
}
