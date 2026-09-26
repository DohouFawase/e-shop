"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFavorites } from "@/store/favoriteSlice";

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const favorites = useAppSelector((state) => state.favorites.items);
  const status = useAppSelector((state) => state.favorites.status);
  const error = useAppSelector((state) => state.favorites.error);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (user) void dispatch(fetchFavorites());
  }, [dispatch, user]);

  const products = useMemo(() => favorites.map((favorite) => favorite.product).filter(Boolean), [favorites]);
  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    for (const product of products) {
      if (product.category) unique.set(product.category.id, product.category.name);
    }
    return Array.from(unique, ([id, name]) => ({ id, name }));
  }, [products]);
  const visibleProducts = selectedCategory === "all"
    ? products
    : products.filter((product) => product.category_id === selectedCategory);

  if (!user) {
    return (
      <main id="main-content" className="site-container min-h-[60vh] py-20">
        <nav aria-label="Fil d’Ariane" className="mb-8 text-xs text-zinc-500"><Link href="/" className="hover:text-zinc-950">Accueil</Link><span className="mx-2">/</span><span className="text-zinc-900">Mes favoris</span></nav>
        <div className="mx-auto max-w-xl border-y border-zinc-900/10 py-14 text-center">
          <Heart className="mx-auto size-8 text-zinc-400" />
          <h1 className="mt-5 font-serif text-3xl text-zinc-950">Vos favoris vous attendent</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-600">Connectez-vous pour retrouver votre sélection personnelle et la garder à portée de main.</p>
          <Link href="/auth" className="mt-7 inline-flex h-11 items-center gap-2 bg-zinc-950 px-6 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-zinc-700">Se connecter <ArrowRight className="size-4" /></Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="site-container min-h-[60vh] pb-20 pt-8 sm:pt-10">
      <nav aria-label="Fil d’Ariane" className="mb-8 text-xs text-zinc-500"><Link href="/" className="hover:text-zinc-950">Accueil</Link><span className="mx-2">/</span><span className="text-zinc-900">Mes favoris</span></nav>

      <header className="relative mb-9 overflow-hidden bg-[#f4f1ec] px-6 py-8 sm:px-10 sm:py-11">
        <Sparkles aria-hidden="true" className="absolute -right-3 -top-4 size-32 rotate-12 text-zinc-900/[0.04] sm:right-10 sm:top-1 sm:size-44" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Votre sélection personnelle</p>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Mes <em className="font-normal">favoris</em></h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">Retrouvez ici les produits que vous avez mis de côté et ajoutez-les à votre panier quand vous le souhaitez.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600"><Heart className="size-4" />{products.length} produit{products.length === 1 ? "" : "s"} enregistré{products.length === 1 ? "" : "s"}</div>
        </div>
      </header>

      {error && <p role="alert" className="mb-6 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}

      {status === "loading" && products.length === 0 ? (
        <div aria-label="Chargement des favoris" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="animate-pulse"><div className="aspect-[3/4] bg-zinc-100" /><div className="mt-3 h-3 w-2/3 bg-zinc-100" /><div className="mt-2 h-4 w-1/2 bg-zinc-100" /></div>)}</div>
      ) : products.length === 0 ? (
        <div className="border-y border-zinc-900/10 py-16 text-center">
          <Heart className="mx-auto size-8 text-zinc-300" />
          <h2 className="mt-5 font-serif text-2xl text-zinc-950">Votre sélection est encore vide</h2>
          <p className="mt-2 text-sm text-zinc-500">Parcourez la boutique et touchez le cœur d’un produit pour le retrouver ici.</p>
          <Link href="/shop" className="mt-6 inline-flex h-11 items-center gap-2 bg-zinc-950 px-6 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-zinc-700">Explorer la boutique <ArrowRight className="size-4" /></Link>
        </div>
      ) : (
        <>
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900/10">
            <div role="tablist" aria-label="Filtrer les favoris par catégorie" className="flex max-w-full gap-6 overflow-x-auto sm:gap-8">
              {[{ id: "all", name: "Tous les favoris" }, ...categories].map((category) => <button key={category.id} type="button" role="tab" aria-selected={selectedCategory === category.id} onClick={() => setSelectedCategory(category.id)} className={`relative shrink-0 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] ${selectedCategory === category.id ? "text-zinc-950 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-zinc-950" : "text-zinc-400 hover:text-zinc-800"}`}>{category.name}</button>)}
            </div>
            <Link href="/shop" className="hidden items-center gap-1 pb-3 text-xs text-zinc-500 hover:text-zinc-950 sm:inline-flex">Continuer les achats <ArrowRight className="size-3.5" /></Link>
          </div>
          {visibleProducts.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} variant="collection" />)}</div> : <p className="border-y border-zinc-900/10 py-10 text-center text-sm text-zinc-500">Aucun favori dans cette catégorie.</p>}
        </>
      )}

      {products.length > 0 && <section className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-zinc-900/10 pt-8 sm:flex-row sm:items-center"><div><h2 className="font-serif text-2xl">Encore envie de découvrir ?</h2><p className="mt-2 text-sm text-zinc-500">Explorez les nouveautés et trouvez votre prochain coup de cœur.</p></div><Link href="/shop" className="inline-flex items-center gap-2 border border-zinc-900/20 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition hover:bg-zinc-950 hover:text-white">Découvrir la boutique <ArrowRight className="size-4" /></Link></section>}
    </main>
  );
}
