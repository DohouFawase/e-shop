import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Finaliser ma commande",
  description: "Renseignez vos informations de livraison et choisissez votre moyen de paiement.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
