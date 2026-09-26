/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Eye,
  PackageSearch,
  Percent,
  ShoppingCart,
  Trophy,
  UsersRound,
} from "lucide-react";

import { formatPrice } from "@/lib/catalog";
import {
  dashboardService,
  type DashboardPeriod,
  type DashboardStats,
} from "@/services/dashboard/dashboardService";
import { useAppSelector } from "@/store/hooks";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};
const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  shipped: "bg-violet-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-slate-400",
};
const periodLabels: Record<DashboardPeriod, string> = {
  day: "Aujourd’hui",
  week: "Cette semaine",
  month: "Ce mois",
};
const number = new Intl.NumberFormat("fr-FR");

function trendLabel(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "Nouveau" : "Stable";
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? "+" : ""}${Math.round(change)}%`;
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  accent,
  trend,
  rising,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof UsersRound;
  accent: string;
  trend?: string;
  rising?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span
          className={`grid size-11 place-items-center rounded-xl ${accent}`}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{detail}</p>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-semibold ${rising ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
          >
            {rising ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {trend}
          </span>
        )}
      </div>
    </article>
  );
}

function BarChart({
  title,
  description,
  data,
  valueKey,
  color,
  formatValue,
  period,
}: {
  title: string;
  description: string;
  data: DashboardStats["series"];
  valueKey: "customers" | "revenue" | "visits" | "conversion_rate";
  color: string;
  formatValue: (value: number) => string;
  period: DashboardPeriod;
}) {
  const max = Math.max(1, ...data.map((item) => item[valueKey]));
  const labelStep = period === "day" ? 3 : period === "month" ? 5 : 1;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <div className="relative flex h-52 items-end gap-1.5 border-b border-slate-100 bg-[linear-gradient(to_bottom,transparent_24%,#f1f5f9_25%,transparent_26%,transparent_49%,#f1f5f9_50%,transparent_51%,transparent_74%,#f1f5f9_75%,transparent_76%)] px-1 sm:gap-2">
        {data.map((item, index) => {
          const value = item[valueKey];
          const height = value > 0 ? Math.max(5, (value / max) * 100) : 1;
          return (
            <div
              key={`${item.label}-${index}`}
              className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
              title={`${item.label} : ${formatValue(value)}`}
            >
              <div
                className={`mx-auto w-full max-w-8 rounded-t-md ${color} transition-all group-hover:brightness-110`}
                style={{ height: `${height}%` }}
              />
              <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white group-hover:block">
                {formatValue(value)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 px-1 sm:gap-2">
        {data.map((item, index) => (
          <span
            key={`${item.label}-label-${index}`}
            className="min-w-0 flex-1 truncate text-center text-[9px] text-slate-400 sm:text-[10px]"
          >
            {index % labelStep === 0 ? item.label : ""}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("week");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [greeting, setGreeting] = useState("Bonjour");
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour");
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void dashboardService
      .stats(period)
      .then((result) => {
        if (active) setStats(result);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Impossible de charger les statistiques.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period]);

  const statusTotal = stats
    ? Object.values(stats.statuses).reduce(
        (sum, value) => sum + Number(value),
        0,
      )
    : 0;
  const ordersTrend = stats
    ? trendLabel(stats.summary.orders_period, stats.previous.orders_period)
    : "";
  const revenueTrend = stats
    ? trendLabel(stats.summary.revenue_period, stats.previous.revenue_period)
    : "";
  const customerTrend = stats
    ? trendLabel(
        stats.summary.customers_new_period,
        stats.previous.customers_new_period,
      )
    : "";
  const visitorTrend = stats
    ? trendLabel(stats.summary.visits_period, stats.previous.visits_period)
    : "";
  const conversionTrend = stats
    ? trendLabel(stats.summary.conversion_rate, stats.previous.conversion_rate)
    : "";
  const percent = (value: number) =>
    `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)}%`;

  return (
    <section className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
            Vue d’ensemble
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Suivi de l’activité et des performances de la boutique.
          </p>
        </div>
        <label className="text-sm text-slate-600">
          <span className="sr-only">Période des statistiques</span>
          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value as DashboardPeriod)
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none focus:border-teal-700"
          >
            {(Object.keys(periodLabels) as DashboardPeriod[]).map((key) => (
              <option key={key} value={key}>
                {periodLabels[key]}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#123b40] via-[#17645e] to-[#27816d] px-6 py-7 text-white shadow-lg sm:px-8">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-24 size-72 rounded-full border-[36px] border-white/5"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 right-48 size-56 rounded-full bg-white/5 blur-2xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-teal-100">
              {periodLabels[period]} ·{" "}
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(
                new Date(),
              )}
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              {user?.first_name ? `${greeting} ${user.first_name},` : `${greeting},`}{" "}
              voici votre boutique.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-teal-50/90">
              Une vue claire de vos ventes, de vos clients et des produits à
              suivre.
            </p>
          </div>
          <Link
            href="/dashboard/products/new"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 shadow-sm transition hover:bg-teal-50"
          >
            Ajouter un produit <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {loading && !stats ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Chargement des statistiques…
        </div>
      ) : (
        stats && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard
                title="Clients"
                value={number.format(stats.summary.customers_total)}
                detail={`${number.format(stats.summary.customers_new_period)} nouveau${stats.summary.customers_new_period === 1 ? "" : "x"} ${period === "day" ? "aujourd’hui" : period === "week" ? "cette semaine" : "ce mois"}`}
                icon={UsersRound}
                accent="bg-sky-50 text-sky-700"
                trend={customerTrend}
                rising={
                  stats.summary.customers_new_period >=
                  stats.previous.customers_new_period
                }
              />
              <StatCard
                title="Visiteurs uniques"
                value={number.format(stats.summary.visits_period)}
                detail={`${number.format(stats.summary.page_views_period)} pages vues · ${periodLabels[period].toLowerCase()}`}
                icon={Eye}
                accent="bg-cyan-50 text-cyan-700"
                trend={visitorTrend}
                rising={
                  stats.summary.visits_period >= stats.previous.visits_period
                }
              />
              <StatCard
                title="Taux de conversion"
                value={percent(stats.summary.conversion_rate)}
                detail={`${number.format(stats.summary.conversions_period)} commande${stats.summary.conversions_period === 1 ? "" : "s"} liée${stats.summary.conversions_period === 1 ? "" : "s"} à un visiteur`}
                icon={Percent}
                accent="bg-fuchsia-50 text-fuchsia-700"
                trend={conversionTrend}
                rising={
                  stats.summary.conversion_rate >=
                  stats.previous.conversion_rate
                }
              />
              <StatCard
                title="Commandes"
                value={number.format(stats.summary.orders_period)}
                detail={`${periodLabels[period]} · toutes les commandes`}
                icon={ShoppingCart}
                accent="bg-violet-50 text-violet-700"
                trend={ordersTrend}
                rising={
                  stats.summary.orders_period >= stats.previous.orders_period
                }
              />
              <StatCard
                title="Revenus estimés"
                value={formatPrice(stats.summary.revenue_period)}
                detail={`${periodLabels[period]} · hors commandes annulées`}
                icon={CircleDollarSign}
                accent="bg-emerald-50 text-emerald-700"
                trend={revenueTrend}
                rising={
                  stats.summary.revenue_period >= stats.previous.revenue_period
                }
              />
              <StatCard
                title="Produits actifs"
                value={number.format(stats.summary.products_active)}
                detail={`Panier moyen : ${formatPrice(stats.summary.average_order_value)}`}
                icon={Boxes}
                accent="bg-amber-50 text-amber-700"
              />
            </div>
            <p className="-mt-3 text-right text-[11px] text-slate-400">
              Évolution comparée à la période précédente
            </p>

            <div className="grid gap-4 xl:grid-cols-2">
              <BarChart
                title="Revenus"
                description={`${periodLabels[period]} · commandes non annulées`}
                data={stats.series}
                valueKey="revenue"
                color="bg-teal-600"
                formatValue={formatPrice}
                period={period}
              />
              <BarChart
                title="Nouveaux clients"
                description={`${periodLabels[period]} · inscriptions par intervalle`}
                data={stats.series}
                valueKey="customers"
                color="bg-sky-500"
                formatValue={(value) =>
                  `${number.format(value)} client${value === 1 ? "" : "s"}`
                }
                period={period}
              />
              <BarChart
                title="Visiteurs uniques"
                description={`${periodLabels[period]} · visiteurs par intervalle`}
                data={stats.series}
                valueKey="visits"
                color="bg-cyan-500"
                formatValue={(value) =>
                  `${number.format(value)} visiteur${value === 1 ? "" : "s"}`
                }
                period={period}
              />
              <BarChart
                title="Taux de conversion"
                description="Commandes attribuées aux visiteurs suivis"
                data={stats.series}
                valueKey="conversion_rate"
                color="bg-fuchsia-500"
                formatValue={percent}
                period={period}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Statuts des commandes
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {periodLabels[period]}
                    </p>
                  </div>
                  <Activity className="size-5 text-slate-400" />
                </div>
                {statusTotal === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    Aucune commande sur cette période.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(statusLabels).map(([key, label]) => {
                      const count = Number(stats.statuses[key] ?? 0);
                      const percent = statusTotal
                        ? (count / statusTotal) * 100
                        : 0;
                      return (
                        <div key={key}>
                          <div className="mb-1.5 flex justify-between text-sm">
                            <span className="text-slate-600">{label}</span>
                            <span className="font-medium text-slate-800">
                              {number.format(count)}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${statusColors[key]}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Commandes récentes
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Dernières commandes reçues
                    </p>
                  </div>
                  <Link
                    href="/dashboard/orders"
                    className="text-sm font-medium text-teal-800 hover:underline"
                  >
                    Tout voir
                  </Link>
                </div>
                {!stats.recent_orders.length ? (
                  <p className="p-8 text-center text-sm text-slate-500">
                    Aucune commande pour le moment.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[540px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-medium">
                            Commande / client
                          </th>
                          <th className="px-5 py-3 font-medium">Statut</th>
                          <th className="px-5 py-3 text-right font-medium">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.recent_orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-5 py-3">
                              <Link
                                href={`/dashboard/orders/${encodeURIComponent(order.id)}`}
                                className="font-medium text-slate-800 hover:text-teal-800"
                              >
                                #{order.id.slice(0, 8).toUpperCase()}
                              </Link>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {order.user
                                  ? `${order.user.first_name} ${order.user.last_name}`.trim()
                                  : "Client"}{" "}
                                ·{" "}
                                {new Intl.DateTimeFormat("fr-FR", {
                                  dateStyle: "medium",
                                }).format(new Date(order.created_at))}
                              </p>
                            </td>
                            <td className="px-5 py-3">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                {statusLabels[order.status] ?? order.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-slate-800">
                              {formatPrice(order.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                      <Trophy className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Meilleures ventes
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Produits les plus commandés ·{" "}
                        {periodLabels[period].toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/products"
                    className="text-sm font-medium text-teal-800 hover:underline"
                  >
                    Catalogue
                  </Link>
                </div>
                {!stats.top_products.length ? (
                  <p className="p-8 text-center text-sm text-slate-500">
                    Pas encore de ventes sur cette période.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {stats.top_products.map((product, index) => {
                      const maxUnits = stats.top_products[0]?.units_sold || 1;
                      return (
                        <div
                          key={`${product.product_id}-${index}`}
                          className="flex items-center gap-3 px-5 py-4"
                        >
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${index === 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"}`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/dashboard/products/${encodeURIComponent(product.product_id)}`}
                              className="truncate text-sm font-medium text-slate-800 hover:text-teal-800"
                            >
                              {product.product_name}
                            </Link>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-amber-400"
                                style={{
                                  width: `${Math.max(5, (product.units_sold / maxUnits) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-800">
                              {number.format(product.units_sold)} vendus
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatPrice(product.revenue)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-700">
                      <AlertTriangle className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Stock à surveiller
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Produits actifs avec 5 unités ou moins
                      </p>
                    </div>
                  </div>
                  <PackageSearch className="size-5 text-slate-400" />
                </div>
                {!stats.low_stock_products.length ? (
                  <p className="p-8 text-center text-sm text-emerald-700">
                    Tout va bien, aucun stock faible.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {stats.low_stock_products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-4 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/products/${encodeURIComponent(product.id)}`}
                            className="truncate text-sm font-medium text-slate-800 hover:text-teal-800"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {product.category?.name ?? "Sans catégorie"}
                          </p>
                        </div>
                        <div
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${product.stock_quantity === 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}
                        >
                          {product.stock_quantity === 0
                            ? "Rupture"
                            : `${product.stock_quantity} restant${product.stock_quantity === 1 ? "" : "s"}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )
      )}
    </section>
  );
}
