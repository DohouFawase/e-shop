"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useAppSelector } from "@/store/hooks";

type PageMetadata = { title: string; description: string };

const pages: Record<string, PageMetadata> = {
  "/": {
    title: "Accueil",
    description: "Découvrez les collections et les nouveautés de la boutique Naya.",
  },
  "/shop": {
    title: "Boutique",
    description: "Parcourez les produits et collections disponibles chez Naya.",
  },
  "/cart": {
    title: "Mon panier",
    description: "Consultez les articles de votre panier avant de commander.",
  },
  "/checkout": {
    title: "Finaliser ma commande",
    description: "Renseignez vos informations de livraison et choisissez votre moyen de paiement.",
  },
  "/contact": {
    title: "Contact",
    description: "Contactez l’équipe Naya pour toute question ou demande d’information.",
  },
  "/account": {
    title: "Mon compte",
    description: "Gérez vos coordonnées, votre profil et les paramètres de votre compte Naya.",
  },
  "/account/orders": {
    title: "Mes commandes",
    description: "Consultez le suivi et l’historique de vos commandes Naya.",
  },
  "/favorites": {
    title: "Mes favoris",
    description: "Retrouvez les produits que vous avez enregistrés dans vos favoris.",
  },
  "/auth": {
    title: "Connexion",
    description: "Connectez-vous à votre compte Naya.",
  },
  "/auth/register": {
    title: "Créer un compte",
    description: "Créez votre compte Naya pour retrouver vos commandes et vos favoris.",
  },
  "/auth/forgot-password": {
    title: "Mot de passe oublié",
    description: "Demandez un lien sécurisé pour réinitialiser votre mot de passe.",
  },
  "/auth/reset-password": {
    title: "Réinitialiser le mot de passe",
    description: "Choisissez un nouveau mot de passe pour votre compte Naya.",
  },
  "/payment/callback": {
    title: "Confirmation du paiement",
    description: "Vérification du résultat de votre paiement.",
  },
  "/dashboard": {
    title: "Tableau de bord admin",
    description: "Vue d’ensemble des ventes, commandes, clients et produits de la boutique.",
  },
  "/dashboard/orders": {
    title: "Commandes admin",
    description: "Gérez et suivez les commandes de la boutique.",
  },
  "/dashboard/contact-messages": {
    title: "Messages de contact",
    description: "Consultez les demandes envoyées à la boutique et répondez aux clients.",
  },
  "/dashboard/customers": {
    title: "Clients",
    description: "Consultez les comptes clients et leur activité de commande.",
  },
  "/dashboard/categories": {
    title: "Catégories",
    description: "Gérez les catégories du catalogue de la boutique.",
  },
  "/dashboard/products": {
    title: "Produits admin",
    description: "Gérez les produits, prix et stocks du catalogue.",
  },
  "/dashboard/products/new": {
    title: "Ajouter un produit",
    description: "Ajoutez un nouveau produit au catalogue de la boutique.",
  },
  "/dashboard/categories/new": {
    title: "Ajouter une catégorie",
    description: "Créez une catégorie pour organiser le catalogue.",
  },
  "/dashboard/reviews": {
    title: "Avis produits",
    description: "Consultez et modérez les avis laissés sur les produits.",
  },
  "/dashboard/profile": {
    title: "Profil administrateur",
    description: "Gérez les coordonnées et les paramètres de sécurité du profil administrateur.",
  },
};

function metadataFor(pathname: string, productName?: string | null): PageMetadata {
  if (pathname.startsWith("/products/")) {
    return {
      title: productName ? `${productName} — Détail du produit` : "Détail du produit",
      description: productName
        ? `Découvrez ${productName} dans la boutique Naya.`
        : "Découvrez les détails, le prix et la disponibilité de ce produit Naya.",
    };
  }
  if (pathname.startsWith("/dashboard/orders/")) {
    return { title: "Détail de commande", description: "Consultez le détail et le statut de cette commande." };
  }
  if (pathname.startsWith("/dashboard/customers/")) {
    return { title: "Fiche client", description: "Consultez le profil et les commandes de ce client." };
  }
  if (/^\/dashboard\/categories\/[^/]+\/edit$/.test(pathname)) {
    return { title: "Modifier une catégorie", description: "Modifiez les informations de cette catégorie du catalogue." };
  }
  if (/^\/dashboard\/categories\/[^/]+$/.test(pathname)) {
    return { title: "Détail de catégorie", description: "Consultez les produits associés à cette catégorie." };
  }
  if (/^\/dashboard\/products\/[^/]+\/edit$/.test(pathname)) {
    return { title: "Modifier un produit", description: "Modifiez les informations, le prix et le stock de ce produit." };
  }
  if (/^\/dashboard\/products\/[^/]+$/.test(pathname)) {
    return { title: "Détail du produit", description: "Consultez les informations et le stock de ce produit." };
  }
  return pages[pathname] ?? {
    title: "Naya",
    description: "Découvrez la boutique Naya et ses collections.",
  };
}

function setMetaContent(selector: string, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, selector.includes("property=") ? selector.match(/property="([^"]+)"/)?.[1] ?? "" : selector.match(/name="([^"]+)"/)?.[1] ?? "");
    document.head.appendChild(element);
  }
  element.content = value;
}

export function RouteMetadata() {
  const pathname = usePathname();
  const selectedProduct = useAppSelector((state) => state.products.selected);
  const productId = pathname.startsWith("/products/") ? decodeURIComponent(pathname.slice("/products/".length)) : "";
  const productName = selectedProduct?.id === productId ? selectedProduct.name : null;

  useEffect(() => {
    const metadata = metadataFor(pathname, productName);
    const brand = pathname.startsWith("/dashboard") ? "Naya Admin" : "Naya";
    const title = `${metadata.title} | ${brand}`;
    document.title = title;
    setMetaContent('meta[name="description"]', "name", metadata.description);
    setMetaContent('meta[property="og:title"]', "property", title);
    setMetaContent('meta[property="og:description"]', "property", metadata.description);
  }, [pathname, productName]);

  return null;
}
