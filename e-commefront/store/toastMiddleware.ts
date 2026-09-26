import type { Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";

type ToastAction = {
  type?: string;
  payload?: unknown;
  error?: { message?: string };
};

const successMessages: Record<string, string> = {
  "auth/login": "Connexion réussie.",
  "auth/register": "Compte créé avec succès.",
  "auth/logout": "Déconnexion réussie.",
  "auth/forgotPassword": "E-mail de réinitialisation envoyé.",
  "auth/resetPassword": "Mot de passe réinitialisé.",
  "auth/verifyEmail": "Adresse e-mail vérifiée.",
  "auth/resendVerificationEmail": "E-mail de vérification renvoyé.",
  "profile/update": "Profil mis à jour.",
  "profile/changePassword": "Mot de passe modifié.",
  "profile/deleteAccount": "Compte supprimé.",
  "products/create": "Produit créé.",
  "products/update": "Produit mis à jour.",
  "products/delete": "Produit supprimé.",
  "products/deleteAll": "Tous les produits ont été supprimés.",
  "categories/create": "Catégorie créée.",
  "categories/update": "Catégorie mise à jour.",
  "categories/delete": "Catégorie supprimée.",
  "categories/deleteAll": "Toutes les catégories ont été supprimées.",
  "cart/updateItem": "Quantité mise à jour.",
  "cart/removeItem": "Produit retiré du panier.",
  "cart/clear": "Panier vidé.",
  "favorites/toggle": "Favoris mis à jour.",
  "reviews/create": "Merci, votre avis a été publié.",
  "orders/create": "Commande enregistrée avec succès.",
  "orders/cancel": "Commande annulée.",
  "orders/updateStatus": "Statut de la commande mis à jour.",
};

function getErrorMessage(action: ToastAction, fallback: string) {
  if (typeof action.payload === "string") return action.payload;
  if (
    action.payload &&
    typeof action.payload === "object" &&
    "message" in action.payload &&
    typeof action.payload.message === "string"
  ) {
    return action.payload.message;
  }
  return action.error?.message || fallback;
}

export const toastMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  if (!action || typeof action !== "object" || !("type" in action)) {
    return result;
  }

  const typedAction = action as ToastAction;
  const type = typedAction.type ?? "";
  const status = type.endsWith("/fulfilled")
    ? "fulfilled"
    : type.endsWith("/rejected")
      ? "rejected"
      : null;
  if (!status) return result;

  const actionName = type.replace(/\/(fulfilled|rejected)$/, "");
  const successMessage = successMessages[actionName];
  if (!successMessage) return result;

  if (status === "fulfilled") {
    if (actionName === "favorites/toggle") {
      const favorited = Boolean(
        typedAction.payload &&
          typeof typedAction.payload === "object" &&
          "favorited" in typedAction.payload &&
          typedAction.payload.favorited,
      );
      toast.success(favorited ? "Produit ajouté aux favoris." : "Produit retiré des favoris.");
    } else {
      toast.success(successMessage);
    }
  } else {
    toast.error(getErrorMessage(typedAction, "Une erreur est survenue."));
  }

  return result;
};
