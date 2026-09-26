"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit3, FolderOpen } from "lucide-react";

import { formatPrice, getStorageUrl } from "@/lib/catalog";
import { fetchCategoryById } from "@/store/categorySlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function CategoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const category = useAppSelector((state) => state.categories.selected);
  const status = useAppSelector((state) => state.categories.status);
  const error = useAppSelector((state) => state.categories.error);

  useEffect(() => {
    void dispatch(fetchCategoryById(id));
  }, [dispatch, id]);

  if (status === "loading" && category?.id !== id) return <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Chargement de la catégorie…</p>;
  if (!category || category.id !== id) return <div><Link href="/dashboard/categories" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-800"><ArrowLeft className="size-4" /> Retour aux catégories</Link><p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Catégorie introuvable."}</p></div>;

  const image = getStorageUrl(category.image);
  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Link href="/dashboard/categories" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-800"><ArrowLeft className="size-4" /> Retour aux catégories</Link><Link href={`/dashboard/categories/${encodeURIComponent(category.id)}/edit`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#697180] px-4 text-sm font-medium text-white hover:bg-[#586170]"><Edit3 className="size-4" /> Modifier</Link></div>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid md:grid-cols-[0.8fr_1.2fr]">
          <div className="flex min-h-64 items-center justify-center bg-slate-50">{image ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={image} alt={category.name} className="h-full max-h-80 w-full object-cover" /></> : <div className="flex flex-col items-center gap-2 text-slate-400"><FolderOpen className="size-10" /><span className="text-sm">Aucune image</span></div>}</div>
          <div className="p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Catégorie</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{category.name}</h1><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{category.description || "Aucune description."}</p><dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm"><div><dt className="text-slate-500">Produits associés</dt><dd className="mt-1 font-medium text-slate-800">{category.products?.length ?? 0}</dd></div><div><dt className="text-slate-500">Créée le</dt><dd className="mt-1 font-medium text-slate-800">{new Date(category.created_at).toLocaleDateString("fr-FR", { dateStyle: "medium" })}</dd></div></dl></div>
        </div>
      </section>
      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-semibold text-slate-900">Produits de cette catégorie</h2><span className="text-sm text-slate-500">{category.products?.length ?? 0} produit{category.products?.length === 1 ? "" : "s"}</span></div>
        {!category.products?.length ? <p className="p-8 text-center text-sm text-slate-500">Aucun produit dans cette catégorie.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-medium">Produit</th><th className="px-5 py-3 font-medium">Stock</th><th className="px-5 py-3 font-medium">Statut</th><th className="px-5 py-3 text-right font-medium">Prix</th></tr></thead><tbody className="divide-y divide-slate-100">{category.products.map((product) => <tr key={product.id}><td className="px-5 py-4"><Link href={`/dashboard/products/${encodeURIComponent(product.id)}`} className="font-medium text-teal-900 hover:underline">{product.name}</Link><p className="mt-0.5 text-xs text-slate-500">{product.unit}</p></td><td className="px-5 py-4 text-slate-600">{product.stock_quantity}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{product.is_active ? "Actif" : "Inactif"}</span></td><td className="px-5 py-4 text-right font-medium text-slate-800">{formatPrice(product.final_price ?? product.price)}</td></tr>)}</tbody></table></div>}
      </section>
    </section>
  );
}
