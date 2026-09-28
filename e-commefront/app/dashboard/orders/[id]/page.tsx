"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { formatPrice } from "@/lib/catalog";
import { fetchOrderById } from "@/store/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { OrderStatus } from "@/types/shop";

const statusLabels: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) => state.orders.selected);
  const status = useAppSelector((state) => state.orders.status);
  const error = useAppSelector((state) => state.orders.error);

  useEffect(() => {
    void dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  if (status === "loading" && order?.id !== orderId) {
    return <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Chargement de la commande…</p>;
  }
  if (!order || order.id !== orderId) {
    return <div><Link href="/dashboard/orders" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-800"><ArrowLeft className="size-4" /> Retour aux commandes</Link><p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Commande introuvable."}</p></div>;
  }

  return (
    <section className="mx-auto max-w-5xl">
      <Link href="/dashboard/orders" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-800"><ArrowLeft className="size-4" /> Retour aux commandes</Link>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Commande</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</h1></div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">{statusLabels[order.status]}</span>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Informations de livraison</h2>
          <dl className="space-y-4 text-sm"><div><dt className="text-slate-500">Adresse</dt><dd className="mt-1 font-medium text-slate-800">{order.shipping_address}</dd></div><div><dt className="text-slate-500">Téléphone</dt><dd className="mt-1 font-medium text-slate-800">{order.phone}</dd></div><div><dt className="text-slate-500">Client</dt><dd className="mt-1 font-medium text-slate-800">{order.user ? `${order.user.first_name} ${order.user.last_name}`.trim() : "Informations client indisponibles"}</dd>{order.user?.email && <dd className="text-slate-500">{order.user.email}</dd>}</div><div><dt className="text-slate-500">Date de commande</dt><dd className="mt-1 font-medium text-slate-800">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.created_at))}</dd></div>{order.notes && <div><dt className="text-slate-500">Note</dt><dd className="mt-1 font-medium text-slate-800">{order.notes}</dd></div>}</dl>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Résumé</h2>
          <dl className="space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Nombre d’articles</dt><dd className="font-medium text-slate-800">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Moyen de paiement</dt><dd className="font-medium text-slate-800">{order.payment_method === "paystack" ? "Paystack" : order.payment_method === "cinetpay" ? "CinetPay" : "Paiement à la livraison"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">État du paiement</dt><dd className={`font-semibold ${order.payment_status === "paid" ? "text-emerald-700" : order.payment_status === "failed" ? "text-red-700" : "text-amber-700"}`}>{order.payment_status === "paid" ? "Payé" : order.payment_status === "pending" ? "En attente" : order.payment_status === "failed" ? "Échec" : "À la livraison"}</dd></div><div className="flex justify-between gap-4 border-t border-slate-100 pt-4"><dt className="font-semibold text-slate-800">Total</dt><dd className="font-semibold text-slate-900">{formatPrice(order.total)}</dd></div></dl>
        </section>
      </div>

      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <h2 className="px-5 py-4 text-lg font-semibold text-slate-900">Articles commandés</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-medium">Produit</th><th className="px-5 py-3 text-right font-medium">Prix unitaire</th><th className="px-5 py-3 text-right font-medium">Quantité</th><th className="px-5 py-3 text-right font-medium">Sous-total</th></tr></thead><tbody className="divide-y divide-slate-100">{order.items.map((item) => <tr key={item.id}><td className="px-5 py-4 font-medium text-slate-800">{item.product_name}</td><td className="px-5 py-4 text-right text-slate-600">{formatPrice(item.unit_price)}</td><td className="px-5 py-4 text-right text-slate-600">{item.quantity}</td><td className="px-5 py-4 text-right font-medium text-slate-800">{formatPrice(item.subtotal)}</td></tr>)}</tbody></table></div>
      </section>
    </section>
  );
}
