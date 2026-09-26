import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte Naya.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
