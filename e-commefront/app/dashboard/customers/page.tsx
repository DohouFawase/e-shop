"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";

import {
  customerService,
  type Customer,
} from "@/services/customers/customerService";

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
const dateTime = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});
const money = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

function formatDate(value: string | null | undefined) {
  return value ? dateTime.format(new Date(value)) : "Non disponible";
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchDraft.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchDraft]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void customerService
      .list({ search: search || undefined, per_page: 15, page })
      .then((result) => {
        if (!active) return;
        setCustomers(result.data);
        setTotal(result.total);
        setLastPage(result.last_page);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Impossible de charger les clients.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, page]);


  return (
    <section className="mx-auto max-w-[1500px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
            Boutique
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Coordonnées, commandes et activité de chaque client. Les connexions sont suivies à partir de maintenant.
          </p>
        </div>
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Rechercher un client</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Nom, e-mail ou téléphone…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-700"
          />
        </label>
      </header>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Téléphone</th>
                <th className="px-4 py-3 font-medium">Inscription</th>
                <th className="px-4 py-3 font-medium">Commandes</th>
                <th className="px-4 py-3 font-medium">Dernière commande</th>
                <th className="px-4 py-3 font-medium">Dernière connexion</th>
                <th className="px-4 py-3 text-right font-medium">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && customers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">Chargement des clients…</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">{search ? "Aucun client ne correspond à la recherche." : "Aucun client inscrit."}</td></tr>
              ) : customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-semibold text-teal-800">
                        {`${customer.first_name[0] ?? ""}${customer.last_name[0] ?? ""}`.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{customer.first_name} {customer.last_name}</p>
                        <p className="truncate text-xs text-slate-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{customer.phone || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(customer.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{number.format(customer.orders_count)}</td>
                  <td className="px-4 py-3">
                    {customer.latest_order_created_at ? (
                      <div className="space-y-1">
                        <p className="whitespace-nowrap text-slate-600">{formatDate(customer.latest_order_created_at)}</p>
                        {customer.latest_order_status && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[customer.latest_order_status] ?? "bg-slate-100 text-slate-600"}`}>
                            {statusLabels[customer.latest_order_status] ?? customer.latest_order_status}
                          </span>
                        )}
                      </div>
                    ) : <span className="text-slate-400">Aucune</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(customer.last_login_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/customers/${encodeURIComponent(customer.id)}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-teal-700 hover:text-teal-800"
                    >
                      <Eye className="size-4" /> Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>{number.format(total)} client{total === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Précédent</button>
            <span>{page} / {lastPage}</span>
            <button type="button" disabled={page >= lastPage || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Suivant</button>
          </div>
        </footer>
      </div>

    </section>
  );
}
