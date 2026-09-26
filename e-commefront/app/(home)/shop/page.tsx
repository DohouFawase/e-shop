import type { Metadata } from "next";

import { ProductCatalog } from "@/components/shop/ProductCatalog";
import { categoryService } from "@/services/categories/categoryService";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category_id?: string; search?: string }> }): Promise<Metadata> {
  const filters = await searchParams;
  if (filters.search?.trim()) {
    return {
      title: `Recherche : ${filters.search.trim()}`,
      description: `Résultats de recherche dans la boutique Naya pour « ${filters.search.trim()} ».`,
    };
  }
  if (filters.category_id) {
    try {
      const category = await categoryService.getById(filters.category_id);
      return {
        title: category.name,
        description: category.description || `Découvrez les produits de la collection ${category.name} chez Naya.`,
      };
    } catch {
      // Garde les métadonnées génériques de la boutique si la catégorie n’est pas disponible.
    }
  }
  return {
    title: "Boutique",
    description: "Parcourez les produits et collections disponibles chez Naya.",
  };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category_id?: string; search?: string }> }) {
  const filters = await searchParams;
  return <ProductCatalog categoryId={filters.category_id ?? ""} searchText={filters.search ?? ""}/>;
}
