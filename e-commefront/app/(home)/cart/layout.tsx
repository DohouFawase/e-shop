import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Panier",
  description: "Consultez les articles de votre panier avant de commander.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
