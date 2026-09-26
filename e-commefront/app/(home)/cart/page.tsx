"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";

import { formatPrice, getImagePaths, getStorageUrl } from "@/lib/catalog";
import { fetchCart, removeCartItem, updateCartItem } from "@/store/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const cart = useAppSelector((state) => state.cart.cart);
  const status = useAppSelector((state) => state.cart.status);
  const error = useAppSelector((state) => state.cart.error);
  const isBusy = status === "loading";

  useEffect(() => {
    if (user) void dispatch(fetchCart());
  }, [dispatch, user]);

  if (!user) {
    return (
      <main id="main-content" className="site-container min-h-[60vh] pb-20 pt-16">
        <h1 className="text-3xl font-medium sm:text-4xl">Mon <span className="font-serif italic">panier</span></h1>
        <div className="mt-12 border-y border-zinc-900/10 py-12 text-center">
          <p className="text-sm uppercase text-zinc-600">Connectez-vous pour retrouver votre panier.</p>
          <Link href="/auth" className="mt-6 inline-flex rounded-full bg-zinc-900 px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-zinc-700">Se connecter</Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="site-container min-h-[60vh] pb-20 pt-16">
      <h1 className="text-[2rem] font-medium leading-none sm:text-4xl xl:text-[2.5rem]">
        Mon <span className="font-serif font-normal italic">panier</span>
      </h1>

      {error && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      {isBusy && !cart ? (
        <div className="mt-12 grid animate-pulse gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">{[1, 2].map((row) => <div key={row} className="flex gap-6 border-y border-zinc-900/10 py-8"><div className="aspect-[3/4] w-24 rounded-lg bg-zinc-100 sm:w-40" /><div className="flex-1 space-y-4 pt-2"><div className="h-4 w-1/2 bg-zinc-100" /><div className="h-3 w-1/3 bg-zinc-100" /><div className="h-8 w-28 bg-zinc-100" /></div></div>)}</div>
          <div className="h-72 rounded-lg border border-zinc-900/10 lg:col-span-5" />
        </div>
      ) : !cart?.items.length ? (
        <div className="mt-12 border-y border-zinc-900/10 py-14 text-center">
          <p className="font-serif text-2xl text-zinc-900">Votre panier est vide</p>
          <p className="mt-2 text-sm text-zinc-500">Parcourez la boutique et trouvez vos prochains coups de cœur.</p>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-zinc-700">Continuer mes achats <ArrowRight className="size-4" /></Link>
        </div>
      ) : (
        <div className="mt-12 grid items-start gap-x-12 gap-y-12 lg:grid-cols-12 xl:gap-x-14">
          <section aria-labelledby="cart-items-heading" className="lg:col-span-7">
            <h2 id="cart-items-heading" className="sr-only">Articles dans votre panier</h2>
            <ul role="list" className="divide-y divide-zinc-900/10 border-y border-zinc-900/10">
              {cart.items.map((item) => {
                const image = getStorageUrl(getImagePaths(item.product.images)[0]);
                const stock = Number(item.product.stock_quantity);
                const soldOut = stock < 1;
                return (
                  <li key={item.id} className="flex gap-4 py-6 sm:gap-6 sm:py-10">
                    <Link href={`/products/${item.product_id}`} aria-label={`Voir ${item.product.name}`} className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:w-40">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={item.product.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
                      ) : <span className="absolute inset-0 grid place-items-center font-serif text-4xl text-zinc-300">N.</span>}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:justify-between sm:gap-5">
                      <div className="min-w-0">
                        <p className="text-xs leading-5 text-zinc-500">{item.product.category?.name ?? "Naya"}</p>
                        <h3 className="mt-1 text-sm font-medium uppercase leading-5"><Link href={`/products/${item.product_id}`} className="hover:underline">{item.product.name}</Link></h3>
                        <p className="mt-1 text-xs uppercase text-zinc-500">{item.product.unit}</p>
                        <p className={`mt-3 text-xs ${soldOut ? "text-red-600" : "text-zinc-500"}`}>{soldOut ? "Indisponible" : stock <= 5 ? `Plus que ${stock} en stock` : "En stock"}</p>
                        <div className="mt-5 flex flex-wrap items-center gap-4">
                          <div className="flex h-9 items-center gap-3 rounded-full border border-zinc-900/15 px-2">
                            <button type="button" disabled={isBusy || item.quantity <= 1} onClick={() => void dispatch(updateCartItem({ productId: item.product_id, values: { quantity: item.quantity - 1 } }))} aria-label={`Diminuer la quantité de ${item.product.name}`} className="grid size-7 place-items-center rounded-full text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-35"><Minus className="size-3.5" /></button>
                            <span aria-live="polite" className="min-w-4 text-center text-xs tabular-nums">{item.quantity}</span>
                            <button type="button" disabled={isBusy || soldOut || item.quantity >= stock} onClick={() => void dispatch(updateCartItem({ productId: item.product_id, values: { quantity: item.quantity + 1 } }))} aria-label={`Augmenter la quantité de ${item.product.name}`} className="grid size-7 place-items-center rounded-full text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-35"><Plus className="size-3.5" /></button>
                          </div>
                          <button type="button" disabled={isBusy} onClick={() => void dispatch(removeCartItem(item.product_id))} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-red-700 disabled:opacity-50"><Trash2 className="size-3.5" /> Retirer</button>
                        </div>
                      </div>
                      <p className="mt-3 shrink-0 text-sm font-medium sm:mt-0 sm:text-right">{formatPrice(item.subtotal)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs leading-5 text-zinc-500">Les frais de livraison et le mode de paiement seront indiqués à l’étape suivante.</p>
          </section>

          <aside aria-labelledby="summary-heading" className="h-fit rounded-lg border border-zinc-900/10 px-5 py-6 sm:p-7 lg:col-span-5 lg:p-8">
            <h2 id="summary-heading" className="text-2xl font-medium">Résumé de la commande</h2>
            <div className="mt-6 space-y-4 border-b border-zinc-900/10 pb-6">
              {cart.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="min-w-0 text-zinc-600">{item.product.name} <span className="text-zinc-400">× {item.quantity}</span></span><span className="shrink-0">{formatPrice(item.subtotal)}</span></div>)}
            </div>
            <div className="grid gap-4 border-b border-zinc-900/10 py-5 text-sm">
              <div className="flex justify-between gap-4"><span className="uppercase text-zinc-600">Sous-total</span><span className="font-medium">{formatPrice(cart.total)}</span></div>
              <p className="text-xs leading-5 text-zinc-500">Livraison et taxes éventuelles calculées à la confirmation de la commande.</p>
            </div>
            <div className="flex justify-between gap-4 py-5 text-sm font-semibold"><span className="uppercase">Total estimé</span><span>{formatPrice(cart.total)}</span></div>
            <button type="button" disabled={isBusy} onClick={() => router.push("/checkout")} className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-4 text-sm font-medium uppercase text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-50">{isBusy ? "Mise à jour…" : "Passer à la commande"}</button>
            <p className="mt-5 text-center text-sm text-zinc-500">ou <Link href="/shop" className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600">Continuer mes achats <span aria-hidden="true">→</span></Link></p>
          </aside>
        </div>
      )}
    </main>
  );
}
