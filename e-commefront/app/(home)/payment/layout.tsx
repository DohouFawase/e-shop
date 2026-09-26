import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Confirmation du paiement",
  description: "Vérification du résultat de votre paiement.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
