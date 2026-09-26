import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Demandez un lien sécurisé pour réinitialiser votre mot de passe.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
