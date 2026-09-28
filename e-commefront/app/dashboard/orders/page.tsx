"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, RefreshCw } from "lucide-react";

import { formatPrice } from "@/lib/catalog";
import { fetchAdminOrders } from "@/store/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { OrderStatus } from "@/types/shop";

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];
const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
};

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.orders.adminOrders);
  const pagination = useAppSelector((state) => state.orders.adminPagination);
  const status = useAppSelector((state) => state.orders.status);
  const error = useAppSelector((state) => state.orders.error);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    void dispatch(fetchAdminOrders({ status: (statusFilter || undefined) as OrderStatus | undefined, per_page: 15, page }));
  }, [dispatch, statusFilter, page]);


  return (
    <section className="mx-auto max-w-[1500px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Boutique</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Gestion des commandes</h1>
          <p className="mt-1 text-sm text-slate-500">Consulte les commandes et ouvre leur fiche détaillée.</p>
        </div>
        <label className="text-sm text-slate-600">
          <span className="sr-only">Filtrer par statut</span>
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="min-w-48 rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-700">
            <option value="">Tous les statuts</option>
            {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </header>

      {error && <div role="alert" className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void dispatch(fetchAdminOrders({ status: (statusFilter || undefined) as OrderStatus | undefined, per_page: 15, page }))} className="inline-flex items-center gap-2 font-medium"><RefreshCw className="size-4" /> Réessayer</button></div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-medium">Commande</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Livraison</th><th className="px-4 py-3 font-medium">Articles</th><th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Statut</th><th className="px-4 py-3 text-right font-medium">Détails</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {status === "loading" && orders.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">Chargement des commandes…</td></tr> : orders.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">Aucune commande à afficher.</td></tr> : orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3"><p className="font-medium text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p><p className="mt-0.5 text-xs text-slate-500">{order.user ? `${order.user.first_name} ${order.user.last_name}`.trim() : "Client"}</p></td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(order.created_at))}</td>
                  <td className="max-w-52 px-4 py-3 text-slate-600"><p className="truncate">{order.shipping_address}</p><p className="text-xs">{order.phone}</p></td>
                  <td className="px-4 py-3 text-slate-600">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{formatPrice(order.total)}<p className="mt-1 text-[11px] font-normal text-slate-500">{order.payment_method === "paystack" ? "Paystack" : order.payment_method === "cinetpay" ? "CinetPay" : "Paiement à la livraison"} · {order.payment_status === "paid" ? "Payé" : order.payment_status === "pending" ? "À confirmer" : order.payment_status === "failed" ? "Échec paiement" : "À régler"}</p></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[order.status]}`}>{statuses.find((item) => item.value === order.status)?.label}</span></td>
                  <td className="px-4 py-3 text-right"><Link href={`/dashboard/orders/${encodeURIComponent(order.id)}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Eye className="size-4" /> Voir les détails</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>{pagination ? `${pagination.total} commande${pagination.total === 1 ? "" : "s"}` : `${orders.length} commande${orders.length === 1 ? "" : "s"}`}</span>
          <div className="flex items-center gap-2"><button type="button" disabled={!pagination || page <= 1 || status === "loading"} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Précédent</button><span>{pagination ? `${pagination.current_page} / ${Math.max(1, pagination.last_page)}` : "1 / 1"}</span><button type="button" disabled={!pagination || page >= pagination.last_page || status === "loading"} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Suivant</button></div>
        </footer>
      </div>
    </section>
  );
}
