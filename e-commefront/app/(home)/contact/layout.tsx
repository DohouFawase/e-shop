import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l’équipe Naya pour toute question ou demande d’information.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
