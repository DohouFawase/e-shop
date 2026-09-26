import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Naya pour retrouver vos commandes et vos favoris.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
