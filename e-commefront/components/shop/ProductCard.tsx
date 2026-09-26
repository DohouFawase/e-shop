"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";

import type { Product } from "@/types/catalog";
import { formatPrice, getImagePaths, getStorageUrl } from "@/lib/catalog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addCartItem } from "@/store/cartSlice";
import { toggleFavorite } from "@/store/favoriteSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { animateProductToCart } from "@/lib/animate-product-to-cart";

export function ProductCard({ product, variant = "default" }: { product: Product; variant?: "default" | "collection" }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const favoriteIds = useAppSelector((state) => state.favorites.productIds);
  const [busy, setBusy] = useState(false);
  const images = getImagePaths(product.images);
  const image = getStorageUrl(images[0]);
  const hoverImage = getStorageUrl(images[1]);
  const isFavorite = favoriteIds.includes(product.id);
  const finalPrice = product.final_price ?? product.price;

  async function handleAddCart(button: HTMLButtonElement) {
    if (!user) {
      router.push("/auth");
      return;
    }
    setBusy(true);
    try {
      await dispatch(
        addCartItem({ product_id: product.id, quantity: 1 }),
      ).unwrap();
      const source = button.closest("article")?.querySelector<HTMLImageElement>("img[data-product-image]") ?? null;
      animateProductToCart(source);
      toast.success("Produit ajouté au panier.");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Impossible d’ajouter ce produit au panier.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleFavorite() {
    if (!user) {
      router.push("/auth");
      return;
    }
    try {
      await dispatch(toggleFavorite({ product_id: product.id })).unwrap();
    } catch {
      // L'erreur reste disponible dans favorites.error.
    }
  }

  if (variant === "collection") {
    return (
      <article className="group/prd relative w-full">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100">
          <Link href={`/products/${product.id}`} aria-label={`Voir ${product.name}`} className="absolute inset-0">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={product.name} data-product-image={product.id} className="h-full w-full object-cover transition duration-500 group-hover/prd:scale-[1.03]" />
            ) : (
              <div className="grid h-full place-items-center bg-zinc-100 font-serif text-5xl text-zinc-300">N.</div>
            )}
            {hoverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hoverImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover/prd:opacity-100" />
            )}
          </Link>
          {product.is_on_discount && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-700">Promotion</span>}
          <button type="button" onClick={() => void handleFavorite()} aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"} className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-zinc-700 shadow-sm transition hover:scale-105 hover:text-rose-600 ${isFavorite ? "text-rose-600" : ""}`}>
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button type="button" disabled={busy || product.stock_quantity < 1} onClick={(event) => void handleAddCart(event.currentTarget)} aria-label={`Ajouter ${product.name} au panier`} className="absolute bottom-3 right-3 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-zinc-900 opacity-0 shadow-md transition duration-200 hover:bg-zinc-900 hover:text-white group-hover/prd:translate-y-0 group-hover/prd:opacity-100 disabled:cursor-not-allowed disabled:text-zinc-300 sm:translate-y-0 sm:opacity-100">
            <ShoppingBag size={16} />
          </button>
        </div>
        <div className="pt-3">
          <p className="text-xs leading-5 text-zinc-500">{product.category?.name ?? "Naya"}</p>
          <Link href={`/products/${product.id}`} className="mt-0.5 block text-sm font-medium leading-5 text-zinc-900 hover:underline">{product.name}</Link>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-sm font-medium text-zinc-900">{formatPrice(finalPrice)}</p>
            {product.is_on_discount && <p className="text-xs text-zinc-400 line-through">{formatPrice(product.price)}</p>}
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-400">{product.unit}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f4eee5]">
        <Link href={`/products/${product.id}`} aria-label={`Voir ${product.name}`} className="absolute inset-0">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={product.name} data-product-image={product.id} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-orange-100 via-amber-50 to-stone-100 text-5xl font-black text-orange-300">N.</div>
          )}
        </Link>
        {product.is_on_discount && <span className="absolute left-3 top-3 rounded-full bg-orange-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Promotion</span>}
        <button
          type="button"
          onClick={() => void handleFavorite()}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 shadow-sm transition hover:scale-105 ${isFavorite ? "text-rose-600" : "text-stone-600 hover:text-rose-600"}`}
        >
          <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="p-4">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-orange-700">{product.category?.name ?? "Sélection"}</p>
        <Link href={`/products/${product.id}`} className="line-clamp-1 font-semibold text-stone-900 hover:text-orange-700">{product.name}</Link>
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600"><Star size={13} fill="currentColor" /> <span>{product.average_rating ?? "Nouveau"}</span><span className="text-stone-400">({product.reviews_count ?? 0})</span></div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-stone-900">{formatPrice(finalPrice)}</p>
            {product.is_on_discount && <p className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</p>}
          </div>
          <button
            type="button"
            disabled={busy || product.stock_quantity < 1}
            onClick={(event) => void handleAddCart(event.currentTarget)}
            className="grid size-10 place-items-center rounded-full bg-stone-900 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            aria-label="Ajouter au panier"
          >
            <ShoppingBag size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
