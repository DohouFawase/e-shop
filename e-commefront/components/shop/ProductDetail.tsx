"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  LoaderCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBestSellers,
  fetchNewArrivals,
  fetchProductById,
  fetchProducts,
} from "@/store/productSlice";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { fetchProductReviews, createReview } from "@/store/reviewSlice";
import { addCartItem } from "@/store/cartSlice";
import { toggleFavorite } from "@/store/favoriteSlice";
import { animateProductToCart } from "@/lib/animate-product-to-cart";
import { formatPrice, getImagePaths, getStorageUrl } from "@/lib/catalog";
import type { Review } from "@/types/shop";

const EMPTY_REVIEWS: Review[] = [];

type ProductTab = "about" | "reviews" | "delivery" | "faq";

export function ProductDetail({
  id,
  reviewOrderItem,
}: {
  id: string;
  reviewOrderItem?: string;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const product = useAppSelector((state) => state.products.selected);
  const relatedProducts = useAppSelector((state) => state.products.items);
  const recommendedProducts = useAppSelector((state) => state.products.bestSellers);
  const newArrivals = useAppSelector((state) => state.products.newArrivals);
  const user = useAppSelector((state) => state.auth.user);
  const reviews = useAppSelector((state) => state.reviews.byProductId[id] ?? EMPTY_REVIEWS);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  const imageTransitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeTab, setActiveTab] = useState<ProductTab>(reviewOrderItem ? "reviews" : "about");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    void dispatch(fetchProductById(id));
    void dispatch(fetchProductReviews(id));
    void dispatch(fetchBestSellers());
    void dispatch(fetchNewArrivals());
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.id === id && product.category_id) {
      void dispatch(fetchProducts({ category_id: product.category_id, per_page: 8 }));
    }
  }, [dispatch, id, product?.id, product?.category_id]);

  useEffect(() => {
    setSelectedImage(0);
    setPreviousImage(null);
    return () => {
      if (imageTransitionTimer.current) clearTimeout(imageTransitionTimer.current);
    };
  }, [id]);

  if (!product || product.id !== id) {
    return (
      <main className="site-container min-h-[55vh] py-24 text-center text-sm text-zinc-500">
        Chargement du produit…
      </main>
    );
  }

  const imagePaths = getImagePaths(product.images);
  const images = imagePaths.map((path) => getStorageUrl(path)).filter((url): url is string => Boolean(url));

  function selectImage(index: number) {
    if (index === selectedImage || !images[selectedImage] || !images[index]) return;
    if (imageTransitionTimer.current) clearTimeout(imageTransitionTimer.current);
    setPreviousImage(images[selectedImage]);
    setSelectedImage(index);
    imageTransitionTimer.current = setTimeout(() => {
      setPreviousImage(null);
      imageTransitionTimer.current = null;
    }, 500);
  }
  const sameCategoryProducts = relatedProducts.filter(
    (item) => item.id !== product.id && item.category_id === product.category_id,
  );
  const excludedIds = new Set([product.id, ...sameCategoryProducts.map((item) => item.id)]);
  const recommended = recommendedProducts.filter((item) => !excludedIds.has(item.id));
  const discoveries = newArrivals.filter(
    (item) => !excludedIds.has(item.id) && !recommended.some((popular) => popular.id === item.id),
  );
  const stockAvailable = product.stock_quantity > 0;
  const hasDiscount = product.is_on_discount && Number(product.discount_price) > 0;

  async function addToCart() {
    if (!user) {
      router.push("/auth");
      return;
    }
    setAddingToCart(true);
    try {
      await dispatch(addCartItem({ product_id: id, quantity })).unwrap();
      animateProductToCart(document.querySelector<HTMLImageElement>(`[data-product-image="${CSS.escape(id)}"]`));
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
      setAddingToCart(false);
    }
  }

  async function favorite() {
    if (!user) {
      router.push("/auth");
      return;
    }
    try {
      await dispatch(toggleFavorite({ product_id: id })).unwrap();
      toast.success("Produit enregistré dans vos favoris.");
    } catch {
      toast.error("Impossible de mettre à jour vos favoris.");
    }
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewOrderItem) return;
    const result = await dispatch(createReview({
      order_item_id: reviewOrderItem,
      rating,
      comment: comment || null,
    }));
    if (createReview.fulfilled.match(result)) setComment("");
  }

  const tabs: { id: ProductTab; label: string }[] = [
    { id: "about", label: "À propos" },
    { id: "reviews", label: `Avis (${reviews.length})` },
    { id: "delivery", label: "Livraison et retours" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <main id="main-content" className="site-container pb-20 pt-8 lg:pt-10">
      <nav aria-label="Fil d’Ariane" className="mb-7 flex flex-wrap items-center gap-2 text-xs text-zinc-500 sm:mb-9">
        <Link href="/" className="hover:text-zinc-950">Accueil</Link><span>/</span>
        <Link href="/shop" className="hover:text-zinc-950">Boutique</Link><span>/</span>
        {product.category && <><Link href={`/shop?category=${encodeURIComponent(product.category_id)}`} className="hover:text-zinc-950">{product.category.name}</Link><span>/</span></>}
        <span className="text-zinc-900">{product.name}</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 xl:gap-20">
        <div className="grid min-w-0 gap-3 sm:grid-cols-[82px_minmax(0,1fr)] sm:gap-4">
          {images.length > 1 && (
            <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col">
              {images.map((src, index) => (
                <button key={`${src}-${index}`} type="button" onClick={() => selectImage(index)} aria-label={`Afficher l’image ${index + 1}`} aria-pressed={selectedImage === index} className={`relative aspect-[3/4] w-[62px] shrink-0 overflow-hidden rounded-sm bg-zinc-100 sm:w-full ${selectedImage === index ? "ring-1 ring-zinc-900 ring-offset-2" : "opacity-70 hover:opacity-100"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="relative order-1 aspect-[4/5] overflow-hidden bg-[#f4f2ed] sm:order-2">
            {images[selectedImage] ? (
              <>
                {previousImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previousImage} alt="" aria-hidden="true" className="absolute inset-0 z-10 size-full animate-out fade-out-0 duration-500 object-cover motion-reduce:animate-none" />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={`${product.id}-${selectedImage}`} src={images[selectedImage]} alt={product.name} data-product-image={product.id} className="absolute inset-0 z-20 size-full animate-in fade-in-0 duration-500 object-cover motion-reduce:animate-none" />
              </>
            ) : <div className="absolute inset-0 grid place-items-center font-serif text-7xl text-zinc-300">N.</div>}
            {hasDiscount && <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-900">Offre spéciale</span>}
          </div>
        </div>

        <div className="flex flex-col py-1 lg:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">{product.category?.name ?? "Sélection de la boutique"}</p>
          <h1 className="mt-3 font-serif text-3xl font-medium leading-tight text-zinc-950 sm:text-4xl xl:text-[42px]">{product.name}</h1>
          <p className="mt-2 text-sm text-zinc-500">Sélection locale</p>
          <a href="#product-reviews" onClick={() => setActiveTab("reviews")} className="mt-5 flex w-fit items-center gap-2 text-xs text-zinc-700">
            <span className="flex items-center gap-0.5 text-amber-600"><Star className="size-3.5" fill="currentColor" />{product.average_rating ? Number(product.average_rating).toFixed(1) : "Nouveau"}</span>
            <span className="text-zinc-400">·</span><span className="underline underline-offset-4">{reviews.length} avis</span>
          </a>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-2xl font-medium text-zinc-950">{formatPrice(product.final_price ?? product.price)}</p>
            {hasDiscount && <p className="text-sm text-zinc-400 line-through">{formatPrice(product.price)}</p>}
            <span className="text-xs text-zinc-500">/ {product.unit}</span>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-600">{product.description || "Un produit de qualité, sélectionné avec soin auprès de nos producteurs."}</p>

          <div className="mt-7 border-y border-zinc-900/10 py-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-800">Quantité</span>
              <span className={`text-xs ${stockAvailable ? "text-emerald-700" : "text-rose-700"}`}>{stockAvailable ? `${product.stock_quantity} disponible${product.stock_quantity === 1 ? "" : "s"}` : "Rupture de stock"}</span>
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 w-full items-center justify-between border border-zinc-900/15 px-3 sm:w-32 sm:shrink-0">
                <button type="button" aria-label="Diminuer la quantité" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="p-1 text-zinc-600 disabled:opacity-30"><Minus className="size-4" /></button>
                <span aria-live="polite" className="text-sm tabular-nums">{quantity}</span>
                <button type="button" aria-label="Augmenter la quantité" disabled={!stockAvailable || quantity >= product.stock_quantity} onClick={() => setQuantity((current) => Math.min(product.stock_quantity, current + 1))} className="p-1 text-zinc-600 disabled:opacity-30"><Plus className="size-4" /></button>
              </div>
              <div className="flex w-full min-w-0 gap-3 sm:flex-1">
                <button type="button" onClick={() => void addToCart()} disabled={!stockAvailable || addingToCart} className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap bg-zinc-950 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:px-5 sm:text-xs sm:tracking-[0.12em]">
                  {addingToCart ? <LoaderCircle className="size-4 shrink-0 animate-spin" /> : <ShoppingBag className="size-4 shrink-0" />}{addingToCart ? "Ajout au panier…" : "Ajouter au panier"}
                </button>
                <button type="button" onClick={() => void favorite()} aria-label="Ajouter aux favoris" className="grid size-12 shrink-0 place-items-center border border-zinc-900/15 text-zinc-800 transition hover:border-zinc-900 hover:text-rose-600"><Heart className="size-5" /></button>
              </div>
            </div>
          </div>

          <div className="mt-5 divide-y divide-zinc-900/10 border-y border-zinc-900/10">
            <div className="flex items-center gap-3 py-3.5"><Truck className="size-4 text-zinc-500" /><p className="text-xs text-zinc-600">Livraison organisée après confirmation de la commande.</p></div>
            <div className="flex items-center gap-3 py-3.5"><ShieldCheck className="size-4 text-zinc-500" /><p className="text-xs text-zinc-600">Paiement sécurisé et suivi de commande depuis votre compte.</p></div>
          </div>

          {sameCategoryProducts.length > 0 && (
            <aside className="mt-7 border border-zinc-900/10 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">À associer</p><p className="mt-1 text-sm font-medium text-zinc-900">Complétez votre sélection</p></div><Link href="/shop" className="text-xs text-zinc-500 hover:text-zinc-950">Voir la boutique <ArrowRight className="ml-1 inline size-3" /></Link></div>
              <div className="mt-4 space-y-3">
                {sameCategoryProducts.slice(0, 2).map((related) => {
                  const relatedImage = getStorageUrl(getImagePaths(related.images)[0]);
                  return <div key={related.id} className="flex items-center gap-3">
                    <Link href={`/products/${related.id}`} className="relative size-16 shrink-0 overflow-hidden bg-zinc-100">
                      {relatedImage ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={relatedImage} alt={related.name} className="absolute inset-0 size-full object-cover" />
                        </>
                      ) : <span className="grid size-full place-items-center font-serif text-2xl text-zinc-300">N.</span>}
                    </Link>
                    <div className="min-w-0 flex-1"><Link href={`/products/${related.id}`} className="line-clamp-2 text-xs font-medium text-zinc-900 hover:underline">{related.name}</Link><p className="mt-1 text-xs text-zinc-500">{formatPrice(related.final_price ?? related.price)}</p></div>
                    <Link href={`/products/${related.id}`} aria-label={`Voir ${related.name}`} className="grid size-8 shrink-0 place-items-center border border-zinc-900/15 hover:bg-zinc-50"><Plus className="size-4" /></Link>
                  </div>;
                })}
              </div>
            </aside>
          )}
        </div>
      </section>

      <section className="mt-16 border-y border-zinc-900/10 sm:mt-20">
        <div role="tablist" aria-label="Informations produit" className="flex gap-6 overflow-x-auto border-b border-zinc-900/10 sm:gap-10">
          {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`relative shrink-0 py-4 text-xs font-semibold uppercase tracking-[0.1em] ${activeTab === tab.id ? "text-zinc-950 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-zinc-950" : "text-zinc-400 hover:text-zinc-800"}`}>{tab.label}</button>)}
        </div>
        <div className="min-h-52 py-7 sm:py-9">
          {activeTab === "about" && <div className="max-w-3xl"><h2 className="font-serif text-2xl text-zinc-950">À propos du produit</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600">{product.description || "Un produit choisi avec soin pour sa qualité et son utilité au quotidien."}</p><dl className="mt-6 grid gap-3 border-t border-zinc-900/10 pt-5 text-sm sm:grid-cols-2"><div><dt className="text-xs text-zinc-500">Catégorie</dt><dd className="mt-1 text-zinc-900">{product.category?.name ?? "—"}</dd></div><div><dt className="text-xs text-zinc-500">Vendu à l’unité</dt><dd className="mt-1 text-zinc-900">{product.unit}</dd></div><div><dt className="text-xs text-zinc-500">Disponibilité</dt><dd className="mt-1 flex items-center gap-1.5 text-zinc-900">{stockAvailable && <Check className="size-3.5 text-emerald-700" />}{stockAvailable ? "En stock" : "Rupture de stock"}</dd></div></dl></div>}
          {activeTab === "reviews" && <div id="product-reviews" className="scroll-mt-24"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-serif text-2xl text-zinc-950">Avis clients</h2><p className="mt-2 text-sm text-zinc-500">{reviews.length ? `${reviews.length} avis partagé${reviews.length === 1 ? "" : "s"} sur ce produit.` : "Aucun avis pour le moment."}</p></div>{product.average_rating != null && <p className="flex items-center gap-2 text-sm text-zinc-700"><Star className="size-4 text-amber-500" fill="currentColor" />{Number(product.average_rating).toFixed(1)} / 5</p>}</div><div className="mt-6 grid gap-4 md:grid-cols-2">{reviews.map((review) => <article key={review.id} className="border border-zinc-900/10 p-5"><p className="text-sm font-medium text-zinc-900">{review.user ? `${review.user.first_name} ${review.user.last_name}` : "Client"}</p><p aria-label={`${review.rating} étoiles sur 5`} className="mt-2 text-sm tracking-wide text-amber-600">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>{review.comment && <p className="mt-3 text-sm leading-6 text-zinc-600">{review.comment}</p>}</article>)}</div>{reviewOrderItem && user && <form onSubmit={submitReview} className="mt-8 max-w-xl border border-zinc-900/10 p-5 sm:p-6"><h3 className="font-medium text-zinc-950">Votre avis sur cet achat</h3><label className="mt-4 block text-xs font-medium text-zinc-700" htmlFor="review-rating">Votre note</label><div className="relative mt-2 w-fit"><select id="review-rating" value={rating} onChange={(event) => setRating(Number(event.target.value))} className="appearance-none border border-zinc-900/15 bg-white py-2 pl-3 pr-9 text-sm">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} étoile{value > 1 ? "s" : ""}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" /></div><label className="mt-4 block text-xs font-medium text-zinc-700" htmlFor="review-comment">Commentaire (facultatif)</label><textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={4} placeholder="Partagez votre expérience avec ce produit" className="mt-2 block w-full resize-y border border-zinc-900/15 p-3 text-sm outline-none focus:border-zinc-500" /><button className="mt-4 inline-flex items-center gap-2 bg-zinc-950 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-700">Publier mon avis <ArrowRight className="size-3.5" /></button></form>}</div>}
          {activeTab === "delivery" && <div className="max-w-3xl"><h2 className="font-serif text-2xl text-zinc-950">Livraison et retours</h2><p className="mt-4 text-sm leading-7 text-zinc-600">Les modalités de livraison et le montant éventuel sont confirmés au moment de la commande selon votre adresse. Vous pouvez suivre l’avancement depuis la rubrique « Mes commandes » de votre compte.</p><p className="mt-3 text-sm leading-7 text-zinc-600">Pour toute question concernant un article reçu, contactez notre équipe en précisant le numéro de commande.</p></div>}
          {activeTab === "faq" && <div className="max-w-3xl"><h2 className="font-serif text-2xl text-zinc-950">Questions fréquentes</h2><details className="group mt-5 border-b border-zinc-900/10 py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-zinc-900">Comment commander ce produit ?<ChevronDown className="size-4 transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-zinc-600">Choisissez la quantité, ajoutez le produit à votre panier puis suivez les étapes de commande et de paiement.</p></details><details className="group border-b border-zinc-900/10 py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-zinc-900">Comment suivre ma commande ?<ChevronDown className="size-4 transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-zinc-600">Retrouvez son statut et ses informations dans « Mes commandes » après connexion à votre compte.</p></details></div>}
        </div>
      </section>

      {sameCategoryProducts.length > 0 && <section className="mt-16 sm:mt-20"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">À découvrir aussi</p><h2 className="mt-2 font-serif text-2xl text-zinc-950 sm:text-3xl">Dans la même catégorie</h2></div><Link href={`/shop?category=${encodeURIComponent(product.category_id)}`} className="hidden items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 sm:inline-flex">Voir tout <ArrowRight className="size-4" /></Link></div><div className="mt-6"><ProductGrid products={sameCategoryProducts} variant="collection" scrollable /></div></section>}
      {recommended.length > 0 && <section className="mt-16 sm:mt-20"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Les favoris de la boutique</p><h2 className="mt-2 font-serif text-2xl text-zinc-950 sm:text-3xl">Nos meilleures ventes</h2><div className="mt-6"><ProductGrid products={recommended.slice(0, 8)} variant="collection" scrollable /></div></section>}
      {discoveries.length > 0 && <section className="mt-16 sm:mt-20"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Fraîchement arrivés</p><h2 className="mt-2 font-serif text-2xl text-zinc-950 sm:text-3xl">À découvrir en ce moment</h2><div className="mt-6"><ProductGrid products={discoveries.slice(0, 8)} variant="collection" scrollable /></div></section>}
    </main>
  );
}
