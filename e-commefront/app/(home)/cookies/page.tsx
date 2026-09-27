import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";
import { CookiePreferencesButton } from "@/components/legal/CookiePreferencesButton";

export const metadata: Metadata = { title: "Cookies et préférences", description: "Informations sur les cookies utilisés par Naya et gestion des préférences." };

export default function CookiesPage() {
  return <LegalDocument title="Cookies et préférences" summary="La boutique utilise des cookies nécessaires à certaines fonctions et, avec votre accord, un identifiant de mesure d’audience.">
    <LegalSection title="Cookies nécessaires"><p>Le cookie <code>accessToken</code> permet de maintenir l’authentification du compte. Un cookie de préférence de navigation peut aussi mémoriser l’état d’un élément d’interface. Ces fonctions sont nécessaires au service demandé ; les désactiver dans le navigateur peut empêcher certaines fonctions.</p></LegalSection>
    <LegalSection title="Mesure d’audience facultative"><p>Avec votre accord, le cookie de première partie <code>naya_visitor_id</code> conserve un identifiant aléatoire pendant 30 jours. Il est transmis avec le chemin de la page consultée afin de mesurer les visites. Il n’est pas créé pour la mesure d’audience si vous refusez.</p></LegalSection>
    <LegalSection title="Modifier votre choix"><p>Votre préférence de mesure d’audience est mémorisée dans le stockage local de ce navigateur. Vous pouvez la modifier à tout moment avec le bouton ci-dessous. Le refus de la mesure d’audience n’empêche pas l’utilisation de la boutique.</p><CookiePreferencesButton /><p>Pour en savoir plus sur les données traitées, consultez la <Link href="/privacy" className="underline underline-offset-4">politique de confidentialité</Link>.</p></LegalSection>
  </LegalDocument>;
}
