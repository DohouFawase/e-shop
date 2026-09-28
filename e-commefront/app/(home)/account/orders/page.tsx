"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronUp, LoaderCircle, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";

import { formatPrice, getImagePaths, getStorageUrl } from "@/lib/catalog";
import { paymentService } from "@/services/orders/paymentService";
import { addCartItem } from "@/store/cartSlice";
import { cancelOrder, fetchMyOrders } from "@/store/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Order } from "@/types/shop";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};
const paymentLabels: Record<string, string> = {
  unpaid: "Paiement à la livraison",
  pending: "Paiement en attente",
  paid: "Payée",
  failed: "Paiement échoué",
};
const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });
const dateOnly = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

function OrderStatusIcon({ status }: { status: Order["status"] }) {
  if (status === "delivered") return <PackageCheck className="size-4" />;
  if (status === "shipped") return <Truck className="size-4" />;
  return <ShoppingBag className="size-4" />;
}

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const orders = useAppSelector((state) => state.orders.myOrders);
  const status = useAppSelector((state) => state.orders.status);
  const error = useAppSelector((state) => state.orders.error);
  const [busyOrder, setBusyOrder] = useState("");
  const [busyItem, setBusyItem] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  useEffect(() => {
    if (user) void dispatch(fetchMyOrders());
  }, [dispatch, user]);

  async function continuePayment(order: Order) {
    setBusyOrder(order.id);
    setPaymentNotice("");
    try {
      if (order.payment_status === "pending" && order.payment_reference) {
        const verification = await paymentService.verify(order.payment_reference);
        await dispatch(fetchMyOrders()).unwrap();
        if (verification.status === "paid") {
          toast.success("Paiement confirmé.");
          return;
        }
        if (verification.status === "pending") {
          setPaymentNotice("CinetPay traite encore le paiement. Vérifie à nouveau dans quelques instants.");
          return;
        }
      }

      const result = await paymentService.retry(order.id);
      if (result.payment?.authorization_url) {
        window.location.assign(result.payment.authorization_url);
        return;
      }
      await dispatch(fetchMyOrders()).unwrap();
      if (result.payment_status === "paid") toast.success("Cette commande est déjà payée.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Impossible de reprendre le paiement.");
    } finally {
      setBusyOrder("");
    }
  }

  async function cancelUnpaidOrder(order: Order) {
    setBusyOrder(order.id);
    try {
      await dispatch(cancelOrder(order.id)).unwrap();
      toast.success("Commande annulée.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Impossible d’annuler la commande.");
    } finally {
      setBusyOrder("");
    }
  }

  async function buyAgain(item: Order["items"][number]) {
    setBusyItem(item.id);
    try {
      await dispatch(addCartItem({ product_id: item.product_id, quantity: item.quantity })).unwrap();
      toast.success(`${item.product_name} ajouté au panier.`);
    } catch (cause) {
      toast.error(typeof cause === "string" ? cause : "Ce produit ne peut pas être ajouté au panier.");
    } finally {
      setBusyItem("");
    }
  }

  function toggleOrder(id: string) {
    setExpandedOrders((current) => current.includes(id) ? current.filter((orderId) => orderId !== id) : [...current, id]);
  }

  if (!user) {
    return (
      <main id="main-content" className="site-container min-h-[60vh] pb-20 pt-16">
        <h1 className="text-3xl font-medium sm:text-4xl">Mes <span className="font-serif italic">commandes</span></h1>
        <div className="mt-12 border-y border-zinc-900/10 py-12 text-center">
          <p className="text-sm text-zinc-600">Connectez-vous pour retrouver le suivi de vos commandes.</p>
          <Link href="/auth" className="mt-6 inline-flex rounded-full bg-zinc-900 px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-zinc-700">Se connecter</Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="site-container min-h-[60vh] pb-20 pt-14 sm:pt-16">
      <header className="mb-10 sm:mb-12">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">Votre espace</p>
        <h1 className="mt-3 text-3xl font-medium leading-none sm:text-4xl xl:text-5xl">Mes <span className="font-serif font-normal italic">commandes</span></h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600">Consultez le suivi, les articles et le paiement de vos commandes.</p>
      </header>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {paymentNotice && <p role="status" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{paymentNotice}</p>}

      {status === "loading" && orders.length === 0 ? (
        <div className="space-y-6">{[1, 2].map((row) => <div key={row} className="animate-pulse border-y border-zinc-900/10 py-6"><div className="h-5 w-48 bg-zinc-100" /><div className="mt-6 flex gap-4"><div className="aspect-[3/4] w-24 rounded-md bg-zinc-100 sm:w-32" /><div className="flex-1 space-y-3"><div className="h-4 w-1/3 bg-zinc-100" /><div className="h-4 w-1/2 bg-zinc-100" /></div></div></div>)}</div>
      ) : orders.length === 0 ? (
        <div className="border-y border-zinc-900/10 py-14 text-center">
          <p className="font-serif text-2xl text-zinc-900">Aucune commande pour le moment</p>
          <p className="mt-2 text-sm text-zinc-500">Vos prochaines commandes apparaîtront ici.</p>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-zinc-700">Découvrir la boutique <ArrowRight className="size-4" /></Link>
        </div>
      ) : (
        <div className="space-y-10">
          {orders.map((order) => {
            const cinetpayUnpaid = order.payment_method === "cinetpay" && order.payment_status !== "paid";
            const canCancel = order.status === "pending" && order.payment_method !== "cinetpay";
            const expanded = expandedOrders.includes(order.id);
            return (
              <article key={order.id} className="border-y border-zinc-900/10">
                <header className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:py-6">
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="text-lg font-medium text-zinc-900">Commande <span className="font-mono text-base">#{order.id.slice(0, 8).toUpperCase()}</span></h2>
                      <span className="text-xs text-zinc-400">·</span>
                      <p className="text-sm text-zinc-500">{dateTime.format(new Date(order.created_at))}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${order.status === "delivered" ? "bg-emerald-50 text-emerald-800" : order.status === "cancelled" ? "bg-zinc-100 text-zinc-600" : "bg-amber-50 text-amber-800"}`}><OrderStatusIcon status={order.status} />{statusLabels[order.status] ?? order.status}</span>
                      {order.payment_method && <span className={`rounded-full px-2.5 py-1 font-medium ${order.payment_status === "paid" ? "bg-emerald-50 text-emerald-800" : order.payment_status === "failed" ? "bg-rose-50 text-rose-800" : "bg-zinc-100 text-zinc-700"}`}>{paymentLabels[order.payment_status ?? "unpaid"] ?? order.payment_status}</span>}
                      <span className="text-zinc-400">{order.items.length} article{order.items.length === 1 ? "" : "s"} · {formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <button type="button" aria-expanded={expanded} aria-controls={`order-detail-${order.id}`} onClick={() => toggleOrder(order.id)} className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-medium uppercase text-zinc-950 underline underline-offset-4 hover:text-zinc-500">{expanded ? "Masquer les détails" : "Détails de la commande"}{expanded ? <ChevronUp className="size-4" /> : <ArrowRight className="size-4" />}</button>
                </header>

                <ul role="list" className="divide-y divide-zinc-900/10 border-t border-zinc-900/10">
                  {order.items.map((item) => {
                    const image = getStorageUrl(getImagePaths(item.product?.images)[0]);
                    return (
                      <li key={item.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:py-6">
                        <div className="flex min-w-0 flex-1 gap-4 sm:gap-6">
                          <Link href={`/products/${item.product_id}`} aria-label={`Voir ${item.product_name}`} className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 sm:w-28">
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image} alt={item.product_name} className="absolute inset-0 size-full object-cover" />
                            ) : <span className="absolute inset-0 grid place-items-center font-serif text-3xl text-zinc-300">N.</span>}
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <h3 className="text-sm font-medium uppercase text-zinc-900"><Link href={`/products/${item.product_id}`} className="hover:underline">{item.product_name}</Link></h3>
                            <p className="mt-1 text-xs text-zinc-500">Quantité : {item.quantity}</p>
                            <p className="mt-2 text-sm font-medium">{formatPrice(item.unit_price)} <span className="text-xs font-normal text-zinc-400">/ unité</span></p>
                            {order.status === "delivered" && <Link href={`/products/${item.product_id}?reviewOrderItem=${item.id}`} className="mt-2 w-fit text-xs font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-950">Laisser un avis</Link>}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-3 sm:w-56 sm:justify-end">
                          <p className="text-sm font-medium text-zinc-950 sm:w-24 sm:text-right">{formatPrice(item.subtotal)}</p>
                          <div className="flex w-full gap-2 sm:w-52 sm:flex-col">
                            <Link href={`/products/${item.product_id}`} className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-900/15 px-3 py-2.5 text-[10px] font-medium uppercase tracking-wide text-zinc-800 transition hover:border-zinc-900 hover:bg-zinc-50 sm:w-full">Voir le produit</Link>
                            <button type="button" disabled={busyItem === item.id} onClick={() => void buyAgain(item)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-3 py-2.5 text-[10px] font-medium uppercase tracking-wide text-white transition hover:bg-zinc-700 disabled:opacity-50 sm:w-full">{busyItem === item.id ? <LoaderCircle className="size-3 animate-spin" /> : <ShoppingBag className="size-3" />} Racheter</button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {expanded && <section id={`order-detail-${order.id}`} className="grid gap-5 border-t border-zinc-900/10 bg-zinc-50/60 px-4 py-5 sm:grid-cols-2 sm:px-6">
                  <div><h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Livraison</h3><p className="mt-2 text-sm text-zinc-800">{order.shipping_address}</p><p className="mt-1 text-sm text-zinc-600">{order.phone}</p>{order.notes && <p className="mt-2 text-xs leading-5 text-zinc-500">Note : {order.notes}</p>}</div>
                  <div><h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Paiement et total</h3><p className="mt-2 text-sm text-zinc-800">{order.payment_method === "cinetpay" ? "CinetPay" : "Paiement à la livraison"} · {paymentLabels[order.payment_status ?? "unpaid"] ?? "À régler"}</p><p className="mt-1 text-sm text-zinc-600">Commande passée le {dateOnly.format(new Date(order.created_at))}</p><p className="mt-2 text-sm font-semibold text-zinc-950">Total : {formatPrice(order.total)}</p></div>
                </section>}

                {(cinetpayUnpaid || canCancel) && <footer className="flex flex-wrap gap-5 border-t border-zinc-900/10 py-4">
                  {cinetpayUnpaid && order.status !== "cancelled" && <button type="button" disabled={busyOrder === order.id} onClick={() => void continuePayment(order)} className="text-sm font-medium text-zinc-900 underline underline-offset-4 disabled:opacity-50">{busyOrder === order.id ? "Vérification…" : order.payment_status === "pending" ? "Vérifier / continuer le paiement" : "Réessayer le paiement CinetPay"}</button>}
                  {canCancel && <button type="button" disabled={busyOrder === order.id} onClick={() => void cancelUnpaidOrder(order)} className="text-sm font-medium text-red-700 underline underline-offset-4 disabled:opacity-50">Annuler cette commande</button>}
                </footer>}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
