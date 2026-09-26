import type { Metadata } from "next";

import { ProductDetail } from "@/components/shop/ProductDetail";
import { productService } from "@/services/products/productService";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await productService.getById(id);
    const description = product.description?.trim().slice(0, 160)
      || `Découvrez ${product.name} dans la boutique Naya.`;
    return {
      title: product.name,
      description,
      openGraph: { title: `${product.name} | Naya`, description, type: "website" },
    };
  } catch {
    return {
      title: "Détail du produit",
      description: "Découvrez les détails, le prix et la disponibilité de ce produit Naya.",
    };
  }
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ reviewOrderItem?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <ProductDetail id={id} reviewOrderItem={query.reviewOrderItem}/>;
}
