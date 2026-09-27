import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation",
  description: "Règles d’accès et d’utilisation du site Naya.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Conditions générales d’utilisation"
      summary="Les présentes conditions encadrent la navigation et l’utilisation du compte client sur la boutique Naya."
    >
      <LegalSection title="Éditeur et acceptation">
        <p>
          Le service est exploité par{" "}
          <strong>
            [dénomination sociale complète, adresse et coordonnées]
          </strong>
          . La création d’un compte suppose la lecture et l’acceptation des
          présentes conditions. La politique de confidentialité décrit
          séparément le traitement des données personnelles.
        </p>
      </LegalSection>
      <LegalSection title="Compte client">
        <p>
          Le client fournit des informations exactes et les tient à jour. Il
          protège ses identifiants et signale toute utilisation non autorisée.
          Les fonctions du compte permettent notamment de consulter les
          commandes, favoris et informations de profil.
        </p>
        <p>
          Naya peut suspendre l’accès en cas d’usage frauduleux ou portant
          atteinte au fonctionnement du service, sous réserve des droits prévus
          par la loi.
        </p>
      </LegalSection>
      <LegalSection title="Utilisation du site">
        <p>
          Il est interdit de perturber le service, de tenter d’accéder sans
          autorisation aux systèmes ou aux données, d’utiliser le site à des
          fins illicites ou de transmettre des contenus portant atteinte aux
          droits de tiers.
        </p>
      </LegalSection>
      <LegalSection title="Contenus et disponibilité">
        <p>
          Les contenus du site appartiennent à Naya ou sont utilisés avec
          autorisation. La boutique peut connaître des interruptions pour
          maintenance ou en raison d’un événement indépendant de son contrôle.
          Les présentes CGU ne remplacent pas les conditions de vente
          applicables aux commandes.
        </p>
      </LegalSection>
      <LegalSection title="Contact et droit applicable">
        <p>
          Pour toute question concernant le site :{" "}
          <strong>[adresse e-mail et adresse postale de l’entreprise]</strong>.
          Droit applicable : droit de la Côte d’Ivoire, sous réserve des
          dispositions impératives applicables au consommateur.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
