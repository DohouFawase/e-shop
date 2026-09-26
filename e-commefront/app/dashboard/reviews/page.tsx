"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Search, Star, Trash2 } from "lucide-react";

import { reviewService } from "@/services/reviews/reviewService";
import type { Review } from "@/types/shop";

function errorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Impossible de charger les avis.";
  }
  return error instanceof Error ? error.message : "Une erreur est survenue.";
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchDraft.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await reviewService.adminList({
        search: search || undefined,
        rating: rating ? Number(rating) : undefined,
        per_page: 15,
        page,
      });
      setReviews(result.data);
      setTotal(result.total);
      setLastPage(result.last_page);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [page, rating, search]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  async function deleteReview(review: Review) {
    if (!window.confirm("Supprimer définitivement cet avis ?")) return;
    setDeletingId(review.id);
    setError("");
    try {
      await reviewService.delete(review.id);
      if (reviews.length === 1 && page > 1) setPage((current) => current - 1);
      else await loadReviews();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="mx-auto max-w-[1500px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Catalogue</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Avis produits</h1>
          <p className="mt-1 text-sm text-slate-500">Consulte les avis publiés et supprime ceux qui ne doivent plus apparaître.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Rechercher un avis</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Client, produit ou commentaire…" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-700" />
          </label>
          <label>
            <span className="sr-only">Filtrer par note</span>
            <select value={rating} onChange={(event) => { setRating(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-700">
              <option value="">Toutes les notes</option>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} étoile{value > 1 ? "s" : ""}</option>)}
            </select>
          </label>
        </div>
      </header>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-medium">Client</th><th className="px-4 py-3 font-medium">Produit</th><th className="px-4 py-3 font-medium">Note</th><th className="px-4 py-3 font-medium">Commentaire</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 text-right font-medium">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading && reviews.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Chargement des avis…</td></tr> : reviews.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Aucun avis à afficher.</td></tr> : reviews.map((review) => (
                <tr key={review.id} className="align-top hover:bg-slate-50/70">
                  <td className="px-4 py-4"><p className="font-medium text-slate-900">{review.user ? `${review.user.first_name} ${review.user.last_name}`.trim() : "Client"}</p>{review.user?.email && <p className="mt-0.5 text-xs text-slate-500">{review.user.email}</p>}</td>
                  <td className="px-4 py-4 font-medium text-slate-700">{review.product?.name ?? "Produit supprimé"}</td>
                  <td className="whitespace-nowrap px-4 py-4"><span className="inline-flex items-center gap-1 font-medium text-amber-600"><Star className="size-4 fill-current" />{review.rating}/5</span></td>
                  <td className="max-w-sm px-4 py-4 text-slate-600">{review.comment || <span className="text-slate-400">Sans commentaire</span>}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(review.created_at))}</td>
                  <td className="px-4 py-4 text-right"><button type="button" onClick={() => void deleteReview(review)} disabled={deletingId === review.id} aria-label="Supprimer cet avis" title="Supprimer" className="grid size-9 place-items-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>{total} avis</span>
          <div className="flex items-center gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Précédent</button><span>{page} / {lastPage}</span><button type="button" disabled={page >= lastPage || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Suivant</button></div>
        </footer>
      </div>
    </section>
  );
}
