import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment Naya collecte et utilise les données personnelles.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Politique de confidentialité"
      summary="Cette page décrit les données traitées lorsque vous naviguez sur la boutique, créez un compte, passez une commande ou contactez Naya."
    >
      <LegalSection title="Responsable du traitement et contact">
        <p>
          Le responsable du traitement est{" "}
          <strong>
            [dénomination sociale complète de l’entreprise qui exploite Naya]
          </strong>
          , située à <strong>[adresse complète en Côte d’Ivoire]</strong>. Pour
          toute demande relative à vos données :{" "}
          <strong>[adresse e-mail de confidentialité]</strong> ou{" "}
          <a className="underline underline-offset-4" href="/contact">
            formulaire de contact
          </a>
          .
        </p>
        <p>
          Les traitements doivent être accomplis selon les formalités
          applicables auprès de l’ARTCI. Référence de déclaration ou
          d’autorisation, si applicable :{" "}
          <strong>[à renseigner après vérification auprès de l’ARTCI]</strong>.
        </p>
      </LegalSection>
      <LegalSection title="Données et finalités">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Compte client : nom, prénom, e-mail et téléphone nécessaires à la
            gestion du compte.
          </li>
          <li>
            Commande : produits, quantités, adresse et téléphone de livraison,
            moyen et statut du paiement, et instructions fournies.
          </li>
          <li>
            Contact : nom, e-mail, sujet et contenu du message afin de répondre
            à la demande et d’en assurer le suivi.
          </li>
          <li>
            Mesure d’audience : identifiant aléatoire du visiteur et chemin des
            pages consultées, uniquement après votre choix d’accepter les
            cookies de mesure d’audience.
          </li>
          <li>
            Sécurité et fonctionnement : données techniques nécessaires à
            l’authentification, à la prévention des abus et au fonctionnement du
            site.
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="Fondements et caractère obligatoire">
        <p>
          Les informations de commande sont nécessaires à son traitement et à sa
          livraison. Les données de compte permettent de fournir les fonctions
          associées au compte. Les demandes adressées au support sont utilisées
          pour y répondre. La mesure d’audience facultative est activée
          seulement si vous l’acceptez. Les champs obligatoires sont signalés
          dans les formulaires ; leur absence peut empêcher la fourniture du
          service demandé.
        </p>
      </LegalSection>
      <LegalSection title="Destinataires et prestataires">
        <p>
          Les données sont accessibles aux personnes habilitées chez Naya. Elles
          peuvent être transmises aux prestataires nécessaires au service,
          notamment au prestataire de paiement CinetPay, au prestataire
          d’hébergement et aux fournisseurs de messagerie utilisés par la
          boutique.{" "}
          <strong>
            [Confirmer la liste réelle des prestataires, leurs rôles et les
            données partagées.]
          </strong>
        </p>
        <p>
          Les données de carte sont saisies auprès du prestataire de paiement et
          ne doivent pas être enregistrées par la boutique. Vérifiez ce point
          avec votre configuration CinetPay avant publication.
        </p>
      </LegalSection>
      <LegalSection title="Durée de conservation et transferts">
        <p>
          Les durées doivent être définies par finalité : compte inactif,
          factures et commandes, messages de contact, journaux techniques et
          mesure d’audience.{" "}
          <strong>
            [Indiquer les durées exactes et les critères
            d’archivage/suppression.]
          </strong>
        </p>
        <p>
          Certains prestataires peuvent héberger ou traiter des données hors de
          Côte d’Ivoire.{" "}
          <strong>
            [Indiquer les pays concernés et les garanties/formalités applicables
            avant tout transfert.]
          </strong>
        </p>
      </LegalSection>
      <LegalSection title="Vos droits">
        <p>
          Dans les conditions prévues par la loi ivoirienne n° 2013-450 relative
          à la protection des données à caractère personnel, vous pouvez
          demander l’accès à vos données, leur rectification ou leur
          suppression, et vous opposer à certains traitements. Adressez votre
          demande à <strong>[adresse e-mail de confidentialité]</strong>. Vous
          pouvez également vous renseigner auprès de l’ARTCI, autorité de
          protection en Côte d’Ivoire.
        </p>
        <p>
          La demande doit permettre de vérifier votre identité sans transmettre
          plus d’informations que nécessaire. Certaines données peuvent devoir
          être conservées lorsqu’une obligation légale l’impose.
        </p>
      </LegalSection>
      <LegalSection title="Sécurité et mise à jour">
        <p>
          Naya met en place des mesures destinées à protéger les données contre
          l’accès non autorisé, la perte, l’altération et la divulgation. Cette
          politique est mise à jour en cas d’évolution des traitements ou des
          obligations applicables ; la version en vigueur est publiée ici.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
