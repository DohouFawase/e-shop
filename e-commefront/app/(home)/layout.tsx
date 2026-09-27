import type { Metadata } from "next";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { StorefrontAccessGuard } from "@/components/shop/StorefrontAccessGuard";
import { StorefrontMotion } from "@/components/shop/StorefrontMotion";
import { StorefrontNavigationLoader } from "@/components/shop/StorefrontNavigationLoader";
import { Toaster } from "sonner";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";

export const metadata: Metadata = {
  title: { default: "Accueil", template: "%s | Naya" },
  description: "Découvrez et commandez les meilleurs produits locaux.",
};

export default function StorefrontLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-full antialiased">
      <StorefrontAccessGuard>
        <StorefrontMotion />
        <StorefrontNavigationLoader />
        <SiteHeader />
        <CookieConsentBanner />
        <div id="storefront-smooth-wrapper">
          <div id="storefront-smooth-content">
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </div>
        <Toaster position="top-right" richColors closeButton duration={4000} />
      </StorefrontAccessGuard>
    </div>
  );
}
