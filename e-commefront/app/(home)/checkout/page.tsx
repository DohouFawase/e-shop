"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CreditCard, LoaderCircle, Smartphone, Trash2 } from "lucide-react";

import { formatPrice, getImagePaths, getStorageUrl } from "@/lib/catalog";
import { getApiErrorMessage } from "@/lib/api-error";
import { orderService } from "@/services/orders/orderService";
import { fetchCart, removeCartItem, updateCartItem } from "@/store/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type PaymentMethod = "cinetpay" | "cash_on_delivery";

const inputClass = "mt-2 block h-12 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-700 focus:ring-2 focus:ring-zinc-100";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const cart = useAppSelector((state) => state.cart.cart);
  const cartStatus = useAppSelector((state) => state.cart.status);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cinetpay");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [salesTermsAccepted, setSalesTermsAccepted] = useState(false);

  useEffect(() => {
    if (user && !cart && cartStatus === "idle") void dispatch(fetchCart());
  }, [cart, cartStatus, dispatch, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await orderService.create({
        shipping_address: address,
        phone,
        notes: notes.trim() || null,
        payment_method: paymentMethod,
        sales_terms_accepted: true,
      });

      if (paymentMethod === "cinetpay") {
        if (result.payment?.authorization_url) {
          window.location.assign(result.payment.authorization_url);
          return;
        }
        await dispatch(fetchCart());
        router.replace("/account/orders");
        return;
      }

      await dispatch(fetchCart());
      router.replace("/account/orders");
    } catch (cause) {
      setError(getApiErrorMessage(cause, "La commande n’a pas pu être créée."));
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <main id="main-content" className="site-container min-h-[60vh] pb-20 pt-16">
        <h1 className="text-3xl font-medium sm:text-4xl">Finaliser <span className="font-serif italic">ma commande</span></h1>
        <div className="mt-12 border-y border-zinc-900/10 py-12 text-center">
          <p className="text-sm text-zinc-600">Connectez-vous pour passer votre commande.</p>
          <Link href="/auth" className="mt-6 inline-flex rounded-full bg-zinc-900 px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-zinc-700">Se connecter</Link>
        </div>
      </main>
    );
  }

  if (cartStatus === "loading" && !cart) {
    return <main id="main-content" className="site-container min-h-[60vh] py-16"><div className="flex items-center justify-center gap-3 py-24 text-sm text-zinc-500"><LoaderCircle className="size-5 animate-spin" />Chargement de votre commande…</div></main>;
  }

  if (!cart?.items.length) {
    return (
      <main id="main-content" className="site-container min-h-[60vh] pb-20 pt-16">
        <h1 className="text-3xl font-medium sm:text-4xl">Finaliser <span className="font-serif italic">ma commande</span></h1>
        <div className="mt-12 border-y border-zinc-900/10 py-14 text-center">
          <p className="font-serif text-2xl text-zinc-900">Votre panier est vide</p>
          <p className="mt-2 text-sm text-zinc-500">Ajoutez des produits avant de passer à la caisse.</p>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-zinc-700">Retour à la boutique <ArrowRight className="size-4" /></Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="site-container pb-20 pt-14 sm:pt-16">
      <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 transition hover:text-zinc-950"><ArrowLeft className="size-4" /> Retour au panier</Link>
      <h1 className="mt-5 text-[2rem] font-medium leading-none sm:text-4xl xl:text-[2.5rem]">Finaliser <span className="font-serif font-normal italic">ma commande</span></h1>

      <form onSubmit={submit} className="mt-10 grid items-start gap-x-12 gap-y-12 lg:grid-cols-2 xl:gap-x-16 2xl:gap-x-20">
        <div className="space-y-10">
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-2xl font-medium text-zinc-950">Coordonnées</h2>
            <label className="mt-5 block text-sm text-zinc-950" htmlFor="checkout-email">Adresse e-mail</label>
            <input id="checkout-email" type="email" value={user.email} readOnly className={`${inputClass} bg-zinc-50 text-zinc-600`} />
            <p className="mt-2 text-xs leading-5 text-zinc-500">Les informations relatives à votre commande seront disponibles dans votre espace client.</p>
          </section>

          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="text-2xl font-medium text-zinc-950">Informations de livraison</h2>
            <div className="mt-5 space-y-5">
              <label className="block text-sm text-zinc-950" htmlFor="checkout-address">Adresse de livraison
                <textarea id="checkout-address" required maxLength={500} autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Quartier, rue, repère…" className="mt-2 block min-h-28 w-full resize-y rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-700 focus:ring-2 focus:ring-zinc-100" />
              </label>
              <label className="block text-sm text-zinc-950" htmlFor="checkout-phone">Téléphone
                <input id="checkout-phone" required maxLength={20} type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Ex. : 07 00 00 00 00" className={inputClass} />
              </label>
              <label className="block text-sm text-zinc-950" htmlFor="checkout-notes">Instructions de livraison <span className="text-zinc-400">(facultatif)</span>
                <textarea id="checkout-notes" maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Un repère ou une précision pour le livreur" className="mt-2 block min-h-24 w-full resize-y rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-700 focus:ring-2 focus:ring-zinc-100" />
              </label>
            </div>
          </section>

          <fieldset>
            <legend className="text-2xl font-medium text-zinc-950">Mode de paiement</legend>
            <div className="mt-5 space-y-3">
              <label className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${paymentMethod === "cinetpay" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"}`}>
                <input type="radio" name="payment-method" value="cinetpay" checked={paymentMethod === "cinetpay"} onChange={() => setPaymentMethod("cinetpay")} className="mt-1 size-4 accent-zinc-900" />
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-zinc-700 ring-1 ring-zinc-200"><CreditCard className="size-4" /></span>
                <span className="flex-1"><span className="block text-sm font-medium text-zinc-950">Paiement sécurisé en ligne</span><span className="mt-1 block text-xs leading-5 text-zinc-500">Carte bancaire ou paiement mobile disponible via CinetPay, selon les moyens activés.</span></span>
              </label>
              <label className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${paymentMethod === "cash_on_delivery" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"}`}>
                <input type="radio" name="payment-method" value="cash_on_delivery" checked={paymentMethod === "cash_on_delivery"} onChange={() => setPaymentMethod("cash_on_delivery")} className="mt-1 size-4 accent-zinc-900" />
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-zinc-700 ring-1 ring-zinc-200"><Smartphone className="size-4" /></span>
                <span className="flex-1"><span className="block text-sm font-medium text-zinc-950">Paiement à la livraison</span><span className="mt-1 block text-xs leading-5 text-zinc-500">Réglez votre commande lorsque vous la recevez.</span></span>
              </label>
            </div>
          </fieldset>
        </div>

        <aside aria-labelledby="order-summary-heading" className="h-fit rounded-lg border border-zinc-900/10 p-5 sm:p-7 lg:sticky lg:top-8 lg:p-8">
          <h2 id="order-summary-heading" className="text-2xl font-medium text-zinc-950">Résumé de la commande</h2>
          <ul role="list" className="mt-6 divide-y divide-zinc-900/10 border-y border-zinc-900/10">
            {cart.items.map((item) => {
              const image = getStorageUrl(getImagePaths(item.product.images)[0]);
              const maxQuantity = Math.max(1, Math.min(8, Number(item.product.stock_quantity) || item.quantity));
              const optionCount = Math.max(maxQuantity, item.quantity);
              return (
                <li key={item.id} className="flex gap-4 py-5">
                  <Link href={`/products/${item.product_id}`} aria-label={`Voir ${item.product.name}`} className="relative aspect-[3/4] size-[4.5rem] shrink-0 overflow-hidden rounded-md bg-zinc-100">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={item.product.name} className="absolute inset-0 size-full object-cover" />
                    ) : <span className="absolute inset-0 grid place-items-center font-serif text-2xl text-zinc-300">N.</span>}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:gap-4">
                    <div className="min-w-0">
                      <Link href={`/products/${item.product_id}`} className="text-sm font-medium uppercase leading-5 hover:underline">{item.product.name}</Link>
                      <p className="mt-1 text-xs text-zinc-500">{item.product.category?.name ?? item.product.unit}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <label className="sr-only" htmlFor={`checkout-quantity-${item.id}`}>Quantité pour {item.product.name}</label>
                        <select id={`checkout-quantity-${item.id}`} aria-label={`Quantité, ${item.product.name}`} value={item.quantity} disabled={cartStatus === "loading" || busy} onChange={(event) => void dispatch(updateCartItem({ productId: item.product_id, values: { quantity: Number(event.target.value) } }))} className="h-8 rounded-md border border-zinc-900/10 bg-white px-2 text-xs outline-none focus:border-zinc-500 disabled:opacity-50">
                          {Array.from({ length: optionCount }, (_, index) => index + 1).map((quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}
                        </select>
                        <button type="button" disabled={cartStatus === "loading" || busy} onClick={() => void dispatch(removeCartItem(item.product_id))} className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-red-700 disabled:opacity-50"><Trash2 className="size-3.5" /> Retirer</button>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-medium sm:text-right">{formatPrice(item.subtotal)}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="grid gap-3 border-b border-zinc-900/10 py-5 text-sm">
            <div className="flex justify-between gap-4"><span className="uppercase text-zinc-600">Sous-total</span><span>{formatPrice(cart.total)}</span></div>
            <p className="text-xs leading-5 text-zinc-500">Les frais de livraison et taxes éventuelles seront précisés lors de la confirmation de la commande.</p>
          </div>
          <div className="flex justify-between gap-4 py-5 text-sm font-semibold"><span className="uppercase">Total estimé</span><span>{formatPrice(cart.total)}</span></div>
          <label className="mb-4 flex items-start gap-2 text-xs leading-5 text-zinc-600"><input type="checkbox" required checked={salesTermsAccepted} onChange={(event) => setSalesTermsAccepted(event.target.checked)} className="mt-1 accent-zinc-900" /><span>J’accepte les <Link href="/sales-terms" className="underline underline-offset-2">conditions générales de vente</Link> et j’ai lu la <Link href="/privacy" className="underline underline-offset-2">politique de confidentialité</Link>.</span></label>
          {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy || cartStatus === "loading"} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-4 text-sm font-medium uppercase text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-50">
            {busy ? <><LoaderCircle className="size-4 animate-spin" />Préparation…</> : paymentMethod === "cinetpay" ? "Continuer vers le paiement" : "Confirmer la commande"}
          </button>
          <p className="mt-5 text-center text-sm text-zinc-500">ou <Link href="/shop" className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600">Continuer mes achats <span aria-hidden="true">→</span></Link></p>
        </aside>
      </form>
    </main>
  );
}
