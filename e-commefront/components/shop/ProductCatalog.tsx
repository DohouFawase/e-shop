"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCategories } from "@/store/categorySlice";
import { fetchProducts } from "@/store/productSlice";
import type { ProductFilters } from "@/schema/products/ProductSchema";

const perPage = 16;
const sortOptions = [
  { value: "created_at:desc", label: "Les plus récents" },
  { value: "price:asc", label: "Prix : croissant" },
  { value: "price:desc", label: "Prix : décroissant" },
  { value: "name:asc", label: "Nom : A à Z" },
  { value: "name:desc", label: "Nom : Z à A" },
];

type FilterMenu = "category" | "price" | "availability" | null;

export function ProductCatalog({
  categoryId,
  searchText,
}: {
  categoryId: string;
  searchText: string;
}) {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const pagination = useAppSelector((state) => state.products.pagination);
  const status = useAppSelector((state) => state.products.status);
  const error = useAppSelector((state) => state.products.error);
  const categories = useAppSelector((state) => state.categories.items);
  const [category, setCategory] = useState(categoryId);
  const [searchInput, setSearchInput] = useState(searchText);
  const [search, setSearch] = useState(searchText);
  const [sort, setSort] = useState("created_at:desc");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(1);
  const [filterMenu, setFilterMenu] = useState<FilterMenu>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeCategory = categories.find((item) => item.id === category);
  const [sortBy, sortDirection] = sort.split(":") as [ProductFilters["sort_by"], ProductFilters["sort_direction"]];
  const filters = useMemo<ProductFilters>(() => ({
    category_id: category || undefined,
    search: search.trim() || undefined,
    min_price: priceRange.min ? Number(priceRange.min) : undefined,
    max_price: priceRange.max ? Number(priceRange.max) : undefined,
    in_stock: inStock || undefined,
    sort_by: sortBy,
    sort_direction: sortDirection,
    per_page: perPage,
    page,
  }), [category, search, priceRange, inStock, sortBy, sortDirection, page]);

  useEffect(() => {
    void dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  function clearFilters() {
    setCategory("");
    setSearchInput("");
    setSearch("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setPriceRange({ min: "", max: "" });
    setInStock(false);
    setPage(1);
    setFilterMenu(null);
  }

  function chooseCategory(id: string) {
    setCategory(id);
    setPage(1);
    setFilterMenu(null);
    setMobileFiltersOpen(false);
  }

  function applyPriceRange() {
    setPriceRange({ min: minPriceInput, max: maxPriceInput });
    setPage(1);
    setFilterMenu(null);
    setMobileFiltersOpen(false);
  }

  const hasFilters = Boolean(category || search || inStock || priceRange.min || priceRange.max);
  const total = pagination?.total ?? products.length;
  const currentPage = pagination?.current_page ?? page;
  const lastPage = pagination?.last_page ?? 1;
  const from = pagination?.from ?? (products.length ? 1 : 0);
  const to = pagination?.to ?? products.length;

  function filterButton(label: string, menu: Exclude<FilterMenu, null>, active = false) {
    return (
      <div className="relative">
        <button type="button" aria-expanded={filterMenu === menu} onClick={() => setFilterMenu((current) => current === menu ? null : menu)} className={`group inline-flex items-center gap-2 py-2 text-xs font-medium uppercase tracking-[0.08em] transition ${active ? "text-zinc-950" : "text-zinc-700 hover:text-zinc-950"}`}>
          {label}{active && <span className="grid size-4 place-items-center rounded-full bg-zinc-900 text-[9px] text-white"><Check className="size-2.5" /></span>}
          <ChevronDown className={`size-4 text-zinc-400 transition group-hover:text-zinc-700 ${filterMenu === menu ? "rotate-180" : ""}`} />
        </button>
        {filterMenu === menu && <div className="absolute left-0 top-full z-30 mt-2 min-w-64 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl">
          {menu === "category" && <div className="max-h-72 space-y-1 overflow-y-auto">
            <button type="button" onClick={() => chooseCategory("")} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50">Toutes les catégories{!category && <Check className="size-4" />}</button>
            {categories.map((item) => <button key={item.id} type="button" onClick={() => chooseCategory(item.id)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50">{item.name}{category === item.id && <Check className="size-4" />}</button>)}
          </div>}
          {menu === "price" && <div>
            <p className="mb-3 text-xs text-zinc-500">Prix en FCFA</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] uppercase tracking-wide text-zinc-500">Minimum<input type="number" min="0" inputMode="numeric" value={minPriceInput} onChange={(event) => setMinPriceInput(event.target.value)} placeholder="0" className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500" /></label>
              <label className="text-[10px] uppercase tracking-wide text-zinc-500">Maximum<input type="number" min="0" inputMode="numeric" value={maxPriceInput} onChange={(event) => setMaxPriceInput(event.target.value)} placeholder="Illimité" className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500" /></label>
            </div>
            <button type="button" onClick={applyPriceRange} className="mt-4 w-full rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-zinc-700">Appliquer</button>
          </div>}
          {menu === "availability" && <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700"><input type="checkbox" checked={inStock} onChange={(event) => { setInStock(event.target.checked); setPage(1); setFilterMenu(null); setMobileFiltersOpen(false); }} className="size-4 accent-zinc-900" />En stock uniquement</label>}
        </div>}
      </div>
    );
  }

  return (
    <main id="main-content" className="min-h-[65vh] bg-white text-zinc-950">
      <div className="site-container">
        <nav aria-label="Fil d’Ariane" className="py-3.5 text-xs font-medium leading-6">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="uppercase text-zinc-900 hover:text-zinc-500">Accueil</Link></li>
            <li aria-hidden="true" className="text-zinc-300">/</li>
            <li><Link href="/shop" className={!category ? "uppercase text-zinc-500" : "uppercase text-zinc-900 hover:text-zinc-500"}>Boutique</Link></li>
            {activeCategory && <><li aria-hidden="true" className="text-zinc-300">/</li><li aria-current="page" className="uppercase text-zinc-500">{activeCategory.name}</li></>}
          </ol>
        </nav>
        <hr className="border-zinc-950/10" />

        <header className="flex flex-col items-center py-14 text-center lg:py-20">
          <svg aria-hidden="true" width="33" height="33" viewBox="0 0 33 33" fill="none" className="text-zinc-950"><path d="M16.5 0C16.5 0 17.95 8.1 21.42 11.58C24.9 15.05 33 16.5 33 16.5C33 16.5 24.9 17.95 21.42 21.42C17.95 24.9 16.5 33 16.5 33C16.5 33 15.05 24.9 11.58 21.42C8.1 17.95 0 16.5 0 16.5C0 16.5 8.1 15.05 11.58 11.58C15.05 8.1 16.5 0 16.5 0Z" fill="currentColor" /></svg>
          <h1 className="mt-5 text-3xl font-medium leading-none sm:text-4xl xl:text-5xl">
            <span className="text-zinc-300">Collection</span><br />
            <span className="font-serif font-normal italic underline decoration-1 underline-offset-4">{activeCategory?.name ?? "Tous les produits"}</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm uppercase leading-6 text-zinc-700">{activeCategory?.description || "Parcourez notre sélection de produits, choisis avec soin pour vous."}</p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-sm uppercase leading-6 text-zinc-500">{total} produit{total === 1 ? "" : "s"}</p>
            <span aria-hidden="true" className="text-sm text-zinc-300">/</span>
            <label className="inline-flex items-center gap-1 text-sm uppercase leading-6 text-zinc-700">
              Trier par
              <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Trier les produits" className="max-w-40 cursor-pointer appearance-none bg-transparent pr-5 font-medium outline-none">
                {sortOptions.map((option, index) => <option key={`${option.value}-${index}`} value={option.value}>{option.label}</option>)}
              </select>
              <ChevronDown className="-ml-5 size-4 shrink-0 text-zinc-400" />
            </label>
          </div>

          <div className="ml-auto flex items-center gap-5">
            <label className="relative hidden w-44 md:block">
              <Search className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input value={searchInput} onChange={(event) => { setSearchInput(event.target.value); setPage(1); }} placeholder="Rechercher" aria-label="Rechercher un produit" className="h-9 w-full border-b border-zinc-200 bg-transparent pl-6 pr-6 text-xs outline-none placeholder:text-zinc-400 focus:border-zinc-700" />
              {searchInput && <button type="button" onClick={() => { setSearchInput(""); setSearch(""); }} aria-label="Effacer la recherche" className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"><X className="size-3.5" /></button>}
            </label>
            <button type="button" onClick={() => setMobileFiltersOpen((open) => !open)} className="inline-flex items-center text-sm font-medium uppercase text-zinc-700 sm:hidden">Filtres <Plus className={`ml-1 size-4 text-zinc-400 transition ${mobileFiltersOpen ? "rotate-45" : ""}`} /></button>
            <div className="hidden items-center gap-6 sm:flex">
              {filterButton("Catégorie", "category", Boolean(category))}
              {filterButton("Prix", "price", Boolean(priceRange.min || priceRange.max))}
              {filterButton("Disponibilité", "availability", inStock)}
            </div>
          </div>
        </div>

        {mobileFiltersOpen && <div className="mt-4 grid gap-3 rounded-lg border border-zinc-200 p-4 sm:hidden">
          <div className="flex flex-wrap items-center gap-4">{filterButton("Catégorie", "category", Boolean(category))}{filterButton("Prix", "price", Boolean(priceRange.min || priceRange.max))}{filterButton("Disponibilité", "availability", inStock)}</div>
          <label className="relative block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><input value={searchInput} onChange={(event) => { setSearchInput(event.target.value); setPage(1); }} placeholder="Rechercher" aria-label="Rechercher un produit" className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-9 text-sm outline-none focus:border-zinc-500" />{searchInput && <button type="button" onClick={() => setSearchInput("")} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2"><X className="size-4" /></button>}</label>
        </div>}

        <hr className="mt-5 border-zinc-950/10" />
        <section aria-label="Produits de la collection" className="pt-10 pb-16 sm:pt-12 sm:pb-24">
          {searchInput && <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500"><Search className="size-4" /><span>Résultats pour « {searchInput} »</span><button type="button" onClick={() => { setSearchInput(""); setSearch(""); }} aria-label="Effacer la recherche" className="ml-1 rounded-full p-1 hover:bg-zinc-100"><X className="size-3.5" /></button></div>}
          {hasFilters && <div className="mb-5 flex justify-end"><button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-500 hover:text-zinc-950">Réinitialiser les filtres <X className="size-3.5" /></button></div>}
          {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {status === "loading" && products.length === 0 ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="animate-pulse"><div className="aspect-[3/4] rounded-lg bg-zinc-100" /><div className="mt-3 h-3 w-1/3 bg-zinc-100" /><div className="mt-2 h-4 w-2/3 bg-zinc-100" /><div className="mt-2 h-4 w-1/4 bg-zinc-100" /></div>)}</div> : products.length === 0 ? <div className="py-20 text-center"><p className="font-serif text-2xl">Aucun produit trouvé</p><p className="mt-2 text-sm text-zinc-500">Essayez de modifier ou de supprimer vos filtres.</p><button type="button" onClick={clearFilters} className="mt-5 text-xs font-semibold uppercase tracking-wide underline underline-offset-4">Réinitialiser les filtres</button></div> : <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-7 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} variant="collection" />)}</div>}

          {lastPage > 1 && <nav aria-label="Pagination des produits" className="mt-12 flex items-center justify-center gap-2 border-t border-zinc-950/10 pt-6">
            <button type="button" disabled={currentPage <= 1 || status === "loading"} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Page précédente" className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-xs uppercase text-zinc-500 hover:text-zinc-950 disabled:opacity-40"><ChevronLeft className="size-4" /> Précédent</button>
            {Array.from({ length: Math.min(lastPage, 5) }, (_, index) => <button key={index} type="button" aria-current={currentPage === index + 1 ? "page" : undefined} onClick={() => setPage(index + 1)} className={`grid size-9 place-items-center rounded-full text-sm ${currentPage === index + 1 ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>{index + 1}</button>)}
            {lastPage > 5 && <><span className="px-1 text-zinc-400">…</span><button type="button" onClick={() => setPage(lastPage)} className="grid size-9 place-items-center rounded-full text-sm text-zinc-600 hover:bg-zinc-100">{lastPage}</button></>}
            <button type="button" disabled={currentPage >= lastPage || status === "loading"} onClick={() => setPage((value) => Math.min(lastPage, value + 1))} aria-label="Page suivante" className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-xs uppercase text-zinc-500 hover:text-zinc-950 disabled:opacity-40">Suivant <ChevronRight className="size-4" /></button>
          </nav>}
          {status !== "loading" && total > 0 && <p className="mt-4 text-center text-[10px] uppercase tracking-[0.12em] text-zinc-400">Affichage {from}–{to} sur {total} produits</p>}
        </section>
      </div>
    </main>
  );
}
