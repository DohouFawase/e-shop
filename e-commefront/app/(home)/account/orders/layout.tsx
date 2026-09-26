import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mes commandes",
  description: "Consultez le suivi et l’historique de vos commandes Naya.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
