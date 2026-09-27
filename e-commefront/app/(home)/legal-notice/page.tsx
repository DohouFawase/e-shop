import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = { title: "Mentions légales", description: "Informations légales relatives à la boutique Naya." };

export default function LegalNoticePage() {
  return <LegalDocument title="Mentions légales" summary="Informations relatives à l’éditeur et à l’hébergement de la boutique Naya.">
    <LegalSection title="Éditeur du site">
      <p>La boutique Naya est éditée par <strong>[dénomination sociale complète]</strong>, <strong>[forme juridique]</strong>, au capital de <strong>[montant]</strong>, immatriculée au RCCM sous le numéro <strong>[numéro RCCM]</strong> et identifiée sous le numéro contribuable/CC <strong>[numéro]</strong>.</p>
      <p>Siège social : <strong>[adresse complète, ville, Côte d’Ivoire]</strong>. Responsable de publication : <strong>[nom et qualité]</strong>. Contact : <strong>[adresse e-mail professionnelle]</strong> · <strong>[téléphone]</strong>.</p>
    </LegalSection>
    <LegalSection title="Hébergement"><p>Le site est hébergé par <strong>[nom légal de l’hébergeur]</strong>, <strong>[adresse de l’hébergeur]</strong>, joignable à <strong>[contact de l’hébergeur]</strong>. Indiquez également le pays où les données sont hébergées.</p></LegalSection>
    <LegalSection title="Propriété intellectuelle"><p>Les textes, visuels, marques et éléments graphiques du site sont protégés. Leur reproduction ou réutilisation nécessite l’autorisation préalable de leur titulaire, sauf exceptions prévues par la loi.</p></LegalSection>
    <LegalSection title="Pages associées"><p><a className="underline underline-offset-4" href="/privacy">Politique de confidentialité</a> · <a className="underline underline-offset-4" href="/terms">Conditions générales d’utilisation</a> · <a className="underline underline-offset-4" href="/sales-terms">Conditions générales de vente</a> · <a className="underline underline-offset-4" href="/cookies">Cookies</a>.</p></LegalSection>
  </LegalDocument>;
}
