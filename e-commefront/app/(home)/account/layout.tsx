import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Gérez vos coordonnées et les paramètres de votre compte Naya.",
};

export default function PageMetadataLayout({ children }: { children: ReactNode }) {
  return children;
}
