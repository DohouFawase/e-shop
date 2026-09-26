"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, FolderOpen, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import { getStorageUrl } from "@/lib/catalog";
import { deleteAllCategories, deleteCategory, fetchCategories } from "@/store/categorySlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function CategoryManagement() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.items);
  const status = useAppSelector((state) => state.categories.status);
  const error = useAppSelector((state) => state.categories.error);
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    void dispatch(fetchCategories());
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    if (!query) return categories;
    return categories.filter((category) =>
      `${category.name} ${category.description ?? ""}`
        .toLocaleLowerCase("fr")
        .includes(query),
    );
  }, [categories, search]);

  async function removeAllCategories() {
    if (!window.confirm("Supprimer définitivement toutes les catégories et les produits qui leur sont associés ? Cette action est irréversible et peut être refusée si des commandes référencent ces produits.")) return;
    setActionError("");
    setDeletingAll(true);
    try {
      await dispatch(deleteAllCategories()).unwrap();
    } catch (error) {
      setActionError(typeof error === "string" ? error : "Impossible de supprimer toutes les catégories.");
    } finally {
      setDeletingAll(false);
    }
  }

  async function removeCategory(id: string, name: string) {
    const confirmed = window.confirm(
      `Supprimer la catégorie « ${name} » ? Les produits qui lui sont associés seront également supprimés.`,
    );
    if (!confirmed) return;
    setActionError("");
    setDeletingId(id);
    try {
      await dispatch(deleteCategory(id)).unwrap();
    } catch (error) {
      setActionError(typeof error === "string" ? error : "Impossible de supprimer cette catégorie.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Catalogue</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Catégories</h1>
          <p className="mt-1 text-sm text-slate-500">Consulte, modifie et organise les catégories de ta boutique.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void removeAllCategories()} disabled={deletingAll || categories.length === 0} className="inline-flex h-11 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="size-4" />{deletingAll ? "Suppression…" : "Tout supprimer"}</button>
          <Link href="/dashboard/categories/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#697180] px-4 text-sm font-medium text-white transition hover:bg-[#586170]"><Plus className="size-4" /> Ajouter une catégorie</Link>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="relative block w-full max-w-md">
          <span className="sr-only">Rechercher une catégorie</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une catégorie…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-700" />
        </label>
        <span className="text-sm text-slate-500">{filteredCategories.length} résultat{filteredCategories.length === 1 ? "" : "s"}</span>
      </div>

      {(error || actionError) && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{actionError || error}</span>
          {!actionError && <button type="button" onClick={() => void dispatch(fetchCategories())} className="inline-flex items-center gap-2 font-medium"><RefreshCw className="size-4" /> Réessayer</button>}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3 font-medium">Catégorie</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Créée le</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {status === "loading" && categories.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500">Chargement des catégories…</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500">{search ? "Aucune catégorie ne correspond à la recherche." : "Aucune catégorie pour le moment."}</td></tr>
              ) : filteredCategories.map((category) => {
                const image = getStorageUrl(category.image);
                return (
                  <tr key={category.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">{image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="size-full object-cover" />
                      ) : <FolderOpen className="size-5" />}</div><span className="font-medium text-slate-900">{category.name}</span></div></td>
                    <td className="max-w-sm px-4 py-3 text-slate-600"><p className="line-clamp-2">{category.description || "—"}</p></td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(category.created_at))}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2">
                      <Link href={`/dashboard/categories/${encodeURIComponent(category.id)}`} aria-label={`Détails de ${category.name}`} title="Voir les détails" className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="size-4" /></Link>
                      <Link href={`/dashboard/categories/${encodeURIComponent(category.id)}/edit`}  aria-label={`Modifier ${category.name}`} title="Modifier" className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"><Edit3 className="size-4" /></Link>
                      <button type="button" onClick={() => void removeCategory(category.id, category.name)} disabled={deletingId === category.id} aria-label={`Supprimer ${category.name}`} title="Supprimer" className="grid size-9 place-items-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-4" /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default CategoryManagement;
