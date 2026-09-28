import Link from "next/link";
import { ArrowUpRight, Leaf } from "lucide-react";
import { CookiePreferencesButton } from "@/components/legal/CookiePreferencesButton";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e8e3db] bg-[#f5f2eb] text-[#263a2d]">
      <div className="site-container pb-7 pt-12 sm:pt-16">
        <div className="grid gap-10 border-b border-[#ded9cf] pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1fr] lg:gap-12">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-black tracking-[0.18em]">
              NAYA<span className="text-[#a45a3d]">.</span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-[#6d776d]">
              Une boutique vivante pour découvrir des produits choisis avec soin et des histoires qui méritent d’être partagées.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#e7e9df] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#526250]">
              <Leaf className="size-3.5" /> Choisir avec intention
            </span>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#344536]">Découvrir</h2>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-[#6d776d]">
              <Link href="/shop" className="transition hover:text-[#a45a3d]">Toute la boutique</Link>
              <Link href="/contact" className="transition hover:text-[#a45a3d]">Nous contacter</Link>
              <Link href="/shop?sort=newest" className="transition hover:text-[#a45a3d]">Nouveautés</Link>
              <Link href="/favorites" className="transition hover:text-[#a45a3d]">Mes favoris</Link>
            </nav>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#344536]">Informations légales</h2>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-[#6d776d]">
              <Link href="/legal-notice" className="transition hover:text-[#a45a3d]">Mentions légales</Link>
              <Link href="/terms" className="transition hover:text-[#a45a3d]">Conditions d’utilisation</Link>
              <Link href="/sales-terms" className="transition hover:text-[#a45a3d]">Conditions de vente</Link>
              <Link href="/privacy" className="transition hover:text-[#a45a3d]">Confidentialité</Link>
              <Link href="/cookies" className="transition hover:text-[#a45a3d]">Cookies</Link>
              <CookiePreferencesButton />
            </nav>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#344536]">Votre compte</h2>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-[#6d776d]">
              <Link href="/account" className="transition hover:text-[#a45a3d]">Mon profil</Link>
              <Link href="/account/orders" className="transition hover:text-[#a45a3d]">Suivre mes commandes</Link>
              <Link href="/auth" className="transition hover:text-[#a45a3d]">Connexion</Link>
            </nav>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs text-[#7c837a] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Naya. Tous droits réservés.</p>
          <p>Design et développement par <span className="font-semibold text-[#526250]">Geodaftar</span></p>
          <Link href="/shop" className="inline-flex items-center gap-1 font-semibold text-[#526250] transition hover:text-[#a45a3d]">Fait pour les belles découvertes <ArrowUpRight className="size-3.5" /></Link>
        </div>
      </div>
    </footer>
  );
}
