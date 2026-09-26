import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mes favoris",
  description: "Retrouvez les produits que vous avez enregistrés dans vos favoris.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
