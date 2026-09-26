import type { Product } from "@/types/catalog";
import { ProductCard } from "@/components/shop/ProductCard";

export function ProductGrid({ products, variant = "default", scrollable = false }: { products?: Product[] | null; variant?: "default" | "collection"; scrollable?: boolean }) {
  const items = Array.isArray(products) ? products : [];
  if (items.length === 0) {
    return <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-stone-500">Aucun produit à afficher pour le moment.</div>;
  }

  if (scrollable) {
    return (
      <div aria-label="Produits à découvrir" role="region" tabIndex={0} className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 scrollbar-thin sm:gap-5">
        {items.map((product) => (
          <div key={product.id} className="w-[72vw] max-w-70 shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]">
            <ProductCard product={product} variant={variant} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {items.map((product) => <ProductCard key={product.id} product={product} variant={variant} />)}
    </div>
  );
}
