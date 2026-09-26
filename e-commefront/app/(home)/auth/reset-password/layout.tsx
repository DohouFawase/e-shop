import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
  description: "Choisissez un nouveau mot de passe pour votre compte Naya.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
