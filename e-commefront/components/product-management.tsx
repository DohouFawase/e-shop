"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, Image as ImageIcon, Plus, Search, Trash2 } from "lucide-react";

import { formatPrice, getImagePaths, getStorageUrl } from "@/lib/catalog";
import { fetchCategories } from "@/store/categorySlice";
import { deleteAllProducts, deleteProduct, fetchManagedProducts } from "@/store/productSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type SortValue = "created_at:desc" | "created_at:asc" | "name:asc" | "price:asc" | "price:desc" | "stock_quantity:asc";

export function ProductManagement() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const pagination = useAppSelector((state) => state.products.pagination);
  const status = useAppSelector((state) => state.products.status);
  const error = useAppSelector((state) => state.products.error);
  const categories = useAppSelector((state) => state.categories.items);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortValue>("created_at:desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [busyId, setBusyId] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    void dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchDraft.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const [sortBy, sortDirection] = sort.split(":") as [
    "created_at" | "name" | "price" | "stock_quantity",
    "asc" | "desc",
  ];

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category_id: categoryId || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      in_stock: stockFilter === "in_stock" ? true : undefined,
      is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      sort_by: sortBy,
      sort_direction: sortDirection,
      page,
      per_page: perPage,
    }),
    [search, categoryId, minPrice, maxPrice, stockFilter, statusFilter, sortBy, sortDirection, page, perPage],
  );

  useEffect(() => {
    void dispatch(fetchManagedProducts(filters));
  }, [dispatch, filters]);

  async function removeAllProducts() {
    if (!window.confirm("Supprimer définitivement tous les produits ? Cette action est irréversible et peut être refusée si des commandes les référencent.")) return;
    setActionError("");
    setDeletingAll(true);
    try {
      await dispatch(deleteAllProducts()).unwrap();
      setPage(1);
    } catch (error) {
      setActionError(typeof error === "string" ? error : "Impossible de supprimer tous les produits.");
    } finally {
      setDeletingAll(false);
    }
  }

  async function removeProduct(id: string, name: string) {
    if (!window.confirm(`Supprimer « ${name} » définitivement ?`)) return;
    setActionError("");
    setBusyId(id);
    try {
      await dispatch(deleteProduct(id)).unwrap();
      if (products.length === 1 && page > 1) setPage((current) => current - 1);
      else void dispatch(fetchManagedProducts(filters));
    } catch (error) {
      setActionError(typeof error === "string" ? error : "Impossible de supprimer ce produit.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="mx-auto max-w-[1500px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Catalogue</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Liste des produits</h1>
          <p className="mt-1 text-sm text-slate-500">Consulte, filtre et gère les produits de ta boutique.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void removeAllProducts()} disabled={deletingAll || products.length === 0} className="inline-flex h-11 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="size-4" />{deletingAll ? "Suppression…" : "Tout supprimer"}</button>
          <Link href="/dashboard/products/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#697180] px-4 text-sm font-medium text-white transition hover:bg-[#586170]"><Plus className="size-4" /> Ajouter un produit</Link>
        </div>
      </header>

      <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-8">
        <label className="relative md:col-span-2 xl:col-span-2">
          <span className="sr-only">Rechercher un produit</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Nom ou description…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-700" />
        </label>
        <select aria-label="Filtrer par catégorie" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-700">
          <option value="">Toutes les catégories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Prix minimum FCFA" type="number" min="0" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); }} placeholder="Prix min" className="min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-700" />
          <input aria-label="Prix maximum FCFA" type="number" min="0" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }} placeholder="Prix max" className="min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-700" />
        </div>
        <select aria-label="Disponibilité" value={stockFilter} onChange={(event) => { setStockFilter(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-700">
          <option value="">Tous les stocks</option>
          <option value="in_stock">En stock</option>
        </select>
        <select aria-label="Statut du produit" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-700">
          <option value="">Tous les statuts</option><option value="active">Actifs</option><option value="inactive">Inactifs</option>
        </select>
        <select aria-label="Trier les produits" value={sort} onChange={(event) => { setSort(event.target.value as SortValue); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-700">
          <option value="created_at:desc">Plus récents</option>
          <option value="created_at:asc">Plus anciens</option>
          <option value="name:asc">Nom A à Z</option>
          <option value="price:asc">Prix croissant</option>
          <option value="price:desc">Prix décroissant</option>
          <option value="stock_quantity:asc">Stock croissant</option>
        </select>
        <select aria-label="Produits par page" value={perPage} onChange={(event) => { setPerPage(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-700 md:col-span-2 xl:col-span-1">
          <option value={15}>15 par page</option><option value={30}>30 par page</option><option value={50}>50 par page</option>
        </select>
      </div>

      {(error || actionError) && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError || error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Produit</th><th className="px-4 py-3 font-medium">Catégorie</th><th className="px-4 py-3 font-medium">Prix</th><th className="px-4 py-3 font-medium">Stock</th><th className="px-4 py-3 font-medium">Statut</th><th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {status === "loading" && products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Chargement des produits…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Aucun produit ne correspond à ces filtres.</td></tr>
              ) : products.map((product) => {
                const image = getStorageUrl(getImagePaths(product.images)[0]);
                return (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt="" className="size-full object-cover" />
                          ) : <ImageIcon className="size-5" />}
                        </div>
                        <div className="min-w-0"><p className="max-w-72 truncate font-medium text-slate-900">{product.name}</p><p className="mt-0.5 max-w-72 truncate text-xs text-slate-500">{product.unit}{product.description ? ` · ${product.description}` : ""}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.category?.name ?? categories.find((category) => category.id === product.category_id)?.name ?? "—"}</td>
                    <td className="px-4 py-3"><p className="font-medium text-slate-800">{formatPrice(product.final_price ?? product.price)}</p>{product.discount_price != null && <p className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</p>}</td>
                    <td className="px-4 py-3 text-slate-600">{product.stock_quantity}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{product.is_active ? "Actif" : "Inactif"}</span></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2">
                      <Link href={`/dashboard/products/${encodeURIComponent(product.id)}`} aria-label={`Détails de ${product.name}`} title="Voir les détails" className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="size-4" /></Link>
                      <Link href={`/dashboard/products/${encodeURIComponent(product.id)}/edit`}  aria-label={`Modifier ${product.name}`} title="Modifier" className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"><Edit3 className="size-4" /></Link>
                      <button type="button" onClick={() => void removeProduct(product.id, product.name)} disabled={busyId === product.id} aria-label={`Supprimer ${product.name}`} title="Supprimer" className="grid size-9 place-items-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-4" /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>{pagination ? `${pagination.total} produit${pagination.total === 1 ? "" : "s"}` : `${products.length} produit${products.length === 1 ? "" : "s"}`}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={!pagination || page <= 1 || status === "loading"} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Précédent</button>
            <span>{pagination ? `${pagination.current_page} / ${Math.max(1, pagination.last_page)}` : "1 / 1"}</span>
            <button type="button" disabled={!pagination || page >= pagination.last_page || status === "loading"} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Suivant</button>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default ProductManagement;
