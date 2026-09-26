"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { StorefrontLoadingScreen } from "@/components/shop/StorefrontLoadingScreen";
import { getImagePaths, getStorageUrl } from "@/lib/catalog";
import { fetchCategories } from "@/store/categorySlice";
import {
  fetchBestSellers,
  fetchLatestProducts,
  fetchNewArrivals,
} from "@/store/productSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Category, Product } from "@/types/catalog";

function imageOf(product?: Product) {
  return getStorageUrl(getImagePaths(product?.images)[0]);
}

function ProductShelf({
  category,
  products,
  eyebrow,
}: {
  category?: Category;
  products: Product[];
  eyebrow: string;
}) {
  const shelf = useRef<HTMLDivElement>(null);
  const title = category?.name ?? eyebrow;
  const description =
    category?.description ||
    `Découvrez notre sélection ${category ? `dans l’univers ${category.name.toLowerCase()}` : "de nouveautés et de coups de cœur"}.`;
  const href = category
    ? `/shop?category_id=${encodeURIComponent(category.id)}`
    : "/shop";

  function scroll(direction: number) {
    shelf.current?.scrollBy({
      left: direction * Math.max(280, shelf.current.clientWidth * 0.8),
      behavior: "smooth",
    });
  }

  return (
    <section className="border-t border-zinc-900/10 py-12 sm:py-16">
      <div className="site-container">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-zinc-950 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-500 sm:text-sm">
              {description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={href}
              className="hidden items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-950 sm:inline-flex"
            >
              Explorer <ArrowRight className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label={`Défiler ${title} vers la gauche`}
              className="grid size-9 place-items-center rounded-full border border-zinc-900/15 text-zinc-800 transition hover:bg-zinc-950 hover:text-white"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label={`Défiler ${title} vers la droite`}
              className="grid size-9 place-items-center rounded-full border border-zinc-900/15 text-zinc-800 transition hover:bg-zinc-950 hover:text-white"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
        {products.length ? (
          <div
            ref={shelf}
            className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 scrollbar-thin sm:-mx-8 sm:gap-5 sm:px-8 lg:-mx-12 lg:px-12"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[67vw] max-w-67.5 shrink-0 snap-start sm:w-[30vw] lg:w-[calc((100%-3.75rem)/4)]"
              >
                <ProductCard product={product} variant="collection" />
              </div>
            ))}
          </div>
        ) : (
          <p className="border-y border-zinc-900/10 py-8 text-sm text-zinc-500">
            Les produits de cette sélection seront bientôt disponibles.
          </p>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const categoriesState = useAppSelector((state) => state.categories.items);
  const newestState = useAppSelector((state) => state.products.newArrivals);
  const popularState = useAppSelector((state) => state.products.bestSellers);
  const latestState = useAppSelector((state) => state.products.latest);
  const [selectedShelf, setSelectedShelf] = useState("new");
  const [isLoading, setIsLoading] = useState(true);
  const categories = Array.isArray(categoriesState) ? categoriesState : [];
  const newest = Array.isArray(newestState) ? newestState : [];
  const popular = Array.isArray(popularState) ? popularState : [];
  const latest = Array.isArray(latestState) ? latestState : [];
  const combined = [...newest, ...popular, ...latest].filter(
    (product, index, products) =>
      products.findIndex((item) => item.id === product.id) === index,
  );
  const featured = newest[0] ?? popular[0] ?? latest[0];
  const fashionCategories = categories.slice(0, 5);
  const selectedProducts =
    selectedShelf === "popular"
      ? popular.length
        ? popular
        : latest
      : newest.length
        ? newest
        : latest;
  const selectedCategory = categories.find(
    (category) => category.id === selectedShelf,
  );
  const heroImage = imageOf(featured);
  const categoryProducts = (category: Category) =>
    combined
      .filter((product) => product.category_id === category.id)
      .slice(0, 8);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([
      dispatch(fetchCategories()),
      dispatch(fetchNewArrivals()),
      dispatch(fetchBestSellers()),
      dispatch(fetchLatestProducts()),
    ]).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [dispatch]);

  return (
    <>
      {isLoading && <StorefrontLoadingScreen />}
      <main id="main-content" className="overflow-hidden bg-white text-zinc-950">
      <section className="mx-auto grid max-w-[1600px] lg:min-h-162.5 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="order-2 flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:order-1 lg:px-14 xl:px-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            La boutique Naya · Côte d’Ivoire
          </p>
          <h1 className="mt-5 max-w-xl font-serif text-[3.2rem] font-normal leading-[0.98] tracking-[-0.045em] sm:text-6xl xl:text-[4.5rem]">
            Le beau se cache
            <br />
            dans les <em className="font-normal">détails.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-zinc-600 sm:text-base">
            Des essentiels, des créations et de belles découvertes choisis avec
            attention. Trouvez les pièces qui vous ressemblent.
          </p>
          <Link
            href="/shop"
            className="group mt-8 inline-flex h-12 w-fit items-center gap-6 border border-zinc-950 px-5 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-zinc-950 hover:text-white"
          >
            Explorer la boutique{" "}
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
          <div className="mt-12 flex items-center gap-5 border-t border-zinc-900/10 pt-5 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            <span>Des choix attentifs</span>
            <span className="size-1 rounded-full bg-zinc-300" />
            <span>Un style qui vous ressemble</span>
          </div>
        </div>
        <div className="relative order-1 min-h-97.5 overflow-hidden bg-[#eeeae4] sm:min-h-135 lg:order-2 lg:min-h-162.5">
          {heroImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt={featured?.name ?? "Sélection Naya"}
                className="absolute inset-0 size-full object-cover"
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_35%,#fff_0%,transparent_38%),linear-gradient(135deg,#e8e2d9,#c7c9bb_58%,#999b8d)]">
              <span className="absolute bottom-[-12%] left-[17%] h-[70%] w-[60%] rotate-[-10deg] rounded-[48%_48%_16%_16%] border border-white/70 bg-white/20 shadow-2xl backdrop-blur-sm" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/5" />
          <span className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-800 backdrop-blur sm:left-8 sm:top-8">
            La sélection du moment
          </span>
          <div className="absolute bottom-6 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-9 sm:left-8 sm:right-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/75">
                À découvrir chez Naya
              </p>
              <p className="mt-2 max-w-md font-serif text-2xl sm:text-3xl">
                {featured?.name ?? "De belles trouvailles, chaque jour."}
              </p>
            </div>
            {featured && (
              <Link
                href={`/products/${featured.id}`}
                aria-label={`Découvrir ${featured.name}`}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-white/70 transition hover:bg-white hover:text-zinc-950"
              >
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-900/10 bg-[#faf9f7]">
        <div className="site-container grid grid-cols-2 divide-x divide-y divide-zinc-900/10 sm:grid-cols-4 sm:divide-y-0">
          {[
            {
              Icon: Leaf,
              title: "Sélection soignée",
              text: "Des découvertes choisies avec attention",
            },
            {
              Icon: PackageCheck,
              title: "Commande facile",
              text: "Un parcours simple de bout en bout",
            },
            {
              Icon: Truck,
              title: "Suivi de livraison",
              text: "Retrouvez le statut de vos commandes",
            },
            {
              Icon: ShieldCheck,
              title: "Paiement sécurisé",
              text: "CinetPay ou paiement à la livraison",
            },
          ].map(({ Icon, title, text }) => (
            <div
              key={title}
              className="flex items-center gap-3 px-4 py-5 sm:px-5 sm:py-6"
            >
              <Icon className="size-4 shrink-0 text-zinc-500" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                  {title}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="site-container pb-8 pt-12 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Les pièces à découvrir
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Trouvez votre prochain coup de cœur
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-700 hover:text-zinc-950 sm:inline-flex"
          >
            Tout voir <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div
          role="tablist"
          aria-label="Sélection de produits"
          className="mt-7 flex gap-6 overflow-x-auto border-b border-zinc-900/10 sm:gap-9"
        >
          {[
            { id: "new", label: "Nouveautés" },
            { id: "popular", label: "Meilleures ventes" },
            ...fashionCategories.map((category) => ({
              id: category.id,
              label: category.name,
            })),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selectedShelf === tab.id}
              onClick={() => setSelectedShelf(tab.id)}
              className={`relative shrink-0 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${selectedShelf === tab.id ? "text-zinc-950 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-zinc-950" : "text-zinc-400 hover:text-zinc-800"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="mt-6">
          {selectedShelf === "new" || selectedShelf === "popular" ? (
            <ProductShelf
              eyebrow={
                selectedShelf === "new" ? "Arrivés récemment" : "Les favoris"
              }
              products={selectedProducts.slice(0, 8)}
            />
          ) : selectedCategory ? (
            <ProductShelf
              category={selectedCategory}
              eyebrow="Notre collection"
              products={categoryProducts(selectedCategory).slice(0, 8)}
            />
          ) : null}
        </div>
      </section>

      {fashionCategories.map((category) => {
        const products = categoryProducts(category);
        if (!products.length) return null;
        return (
          <ProductShelf
            key={category.id}
            category={category}
            products={products}
            eyebrow="Explorer la collection"
          />
        );
      })}

      <section className="bg-[#f4f1ec]">
        <div className="site-container grid lg:grid-cols-2">
          <div className="relative min-h-82.5 overflow-hidden bg-[#e4ded5] sm:min-h-122.5">
            {imageOf(popular[0] ?? featured) ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageOf(popular[0] ?? featured)!}
                  alt={
                    popular[0]?.name ?? featured?.name ?? "Une sélection Naya"
                  }
                  className="absolute inset-0 size-full object-cover"
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#d7d0c6,#9da495)]" />
            )}
          </div>
          <div className="flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:px-16 xl:px-24">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              L’esprit de la boutique
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Le style, c’est
              <br />
              ce qui vous <em className="font-normal">ressemble.</em>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-600">
              Nous réunissons des produits utiles, de belles créations et des
              trouvailles qui donnent envie de les garder. Explorez nos
              collections et laissez-vous inspirer.
            </p>
            <div className="mt-7 grid gap-3 text-xs text-zinc-700 sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <Sparkles className="size-4 text-zinc-500" /> Des nouveautés
                régulièrement
              </p>
              <p className="flex items-center gap-2">
                <Leaf className="size-4 text-zinc-500" /> Des sélections
                choisies avec soin
              </p>
            </div>
            <Link
              href="/shop"
              className="group mt-8 inline-flex w-fit items-center gap-3 border-b border-zinc-900/30 pb-2 text-xs font-semibold uppercase tracking-wider"
            >
              Voir toutes les collections{" "}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="site-container grid gap-3 py-12 sm:grid-cols-3 sm:py-16">
        {categories.slice(0, 3).map((category, index) => {
          const product =
            categoryProducts(category)[index] ?? categoryProducts(category)[0];
          const image = imageOf(product);
          return (
            <Link
              key={category.id}
              href={`/shop?category_id=${encodeURIComponent(category.id)}`}
              className="group relative min-h-70 overflow-hidden bg-zinc-100 sm:min-h-95"
            >
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt=""
                    className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-zinc-100 to-stone-300" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/5" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white sm:inset-x-6 sm:bottom-6">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    Collection {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 font-serif text-2xl">{category.name}</p>
                </div>
                <span className="grid size-9 place-items-center rounded-full border border-white/70 transition group-hover:bg-white group-hover:text-zinc-950">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="border-t border-zinc-900/10 bg-[#faf9f7]">
        <div className="site-container grid gap-6 py-12 sm:grid-cols-[1fr_auto] sm:items-center sm:py-16">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Votre prochaine trouvaille vous attend
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Explorez les collections Naya.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
              Des idées à offrir, des essentiels à adopter et de nouvelles
              inspirations à découvrir.
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex h-12 items-center justify-center gap-3 border border-zinc-950 px-6 text-xs font-semibold uppercase tracking-wider transition hover:bg-zinc-950 hover:text-white"
          >
            Entrer dans la boutique{" "}
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
      </main>
    </>
  );
}
