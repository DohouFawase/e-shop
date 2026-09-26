"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { customerService, type Customer } from "@/services/customers/customerService";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};
const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
};
const number = new Intl.NumberFormat("fr-FR");
const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });
const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 });
const formatDate = (value?: string | null) => value ? dateTime.format(new Date(value)) : "Non disponible";

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void customerService.getById(id)
      .then((result) => { if (active) setCustomer(result); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Impossible de charger le client.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Chargement du client…</p>;
  if (!customer) return <div><Link href="/dashboard/customers" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-800"><ArrowLeft className="size-4" />Retour aux clients</Link><p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Client introuvable."}</p></div>;

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-800"><ArrowLeft className="size-4" />Retour aux clients</Link>
      <header className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Fiche client</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{customer.first_name} {customer.last_name}</h1>
        <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Informations du client</h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-slate-500">Téléphone</dt><dd className="mt-1 font-medium text-slate-800">{customer.phone || "Non renseigné"}</dd></div>
          <div><dt className="text-slate-500">Inscription</dt><dd className="mt-1 font-medium text-slate-800">{formatDate(customer.created_at)}</dd></div>
          <div><dt className="text-slate-500">Dernière connexion</dt><dd className="mt-1 font-medium text-slate-800">{formatDate(customer.last_login_at)}</dd></div>
          <div><dt className="text-slate-500">Nombre de commandes</dt><dd className="mt-1 font-medium text-slate-800">{number.format(customer.orders?.length ?? customer.orders_count)}</dd></div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-semibold text-slate-900">Historique des commandes</h2><span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">{number.format(customer.orders?.length ?? 0)}</span></div>
        {!customer.orders?.length ? <p className="p-8 text-center text-sm text-slate-500">Ce client n’a pas encore passé de commande.</p> : (
          <div className="divide-y divide-slate-100">
            {customer.orders.map((order) => (
              <article key={order.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><h3 className="font-medium text-slate-900">Commande #{order.id.slice(0, 8).toUpperCase()}</h3><p className="mt-1 text-xs text-slate-500">{formatDate(order.created_at)}</p></div>
                  <div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status] ?? "bg-slate-100 text-slate-600"}`}>{statusLabels[order.status] ?? order.status}</span><span className="font-semibold text-slate-900">{money.format(Number(order.total))}</span></div>
                </div>
                <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100 text-sm">
                  {order.items.map((item) => <li key={item.id} className="flex justify-between gap-3 py-2 text-slate-600"><span>{item.product_name} × {number.format(item.quantity)}</span><span className="whitespace-nowrap">{money.format(Number(item.subtotal))}</span></li>)}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
