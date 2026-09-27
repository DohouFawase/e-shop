import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions de commande, paiement et livraison de la boutique Naya.",
};

export default function SalesTermsPage() {
  return (
    <LegalDocument
      title="Conditions générales de vente"
      summary="Projet de conditions applicables aux achats effectués auprès de Naya. Les éléments commerciaux entre crochets doivent être complétés selon les modalités réellement proposées."
    >
      <LegalSection title="Vendeur">
        <p>
          Vendeur :{" "}
          <strong>
            [dénomination sociale, forme juridique, RCCM/identifiant, adresse et
            contacts]
          </strong>
          . Les présentes conditions s’appliquent aux achats réalisés sur la
          boutique Naya par des consommateurs situés dans{" "}
          <strong>[zones effectivement desservies]</strong>.
        </p>
      </LegalSection>
      <LegalSection title="Produits et prix">
        <p>
          Les produits, leurs caractéristiques essentielles, leur disponibilité
          et leur prix sont présentés sur chaque fiche. Les prix sont affichés
          en francs CFA (XOF). Avant la validation définitive, le client doit
          pouvoir consulter le total à payer, y compris les frais de livraison
          et taxes applicables.{" "}
          <strong>
            [Préciser le régime de taxes et les frais applicables.]
          </strong>
        </p>
      </LegalSection>
      <LegalSection title="Commande et confirmation">
        <p>
          Le client vérifie son panier, indique les informations de livraison,
          choisit le paiement et confirme sa commande depuis le formulaire de
          paiement. La commande est ensuite enregistrée dans son espace.{" "}
          <strong>
            [Préciser à quel moment le contrat est conclu et comment la
            confirmation durable est remise au client.]
          </strong>
        </p>
        <p>
          Naya peut contacter le client si une information nécessaire est
          manquante ou si un produit est indisponible. Toute annulation ou
          modification doit être confirmée par le service client.
        </p>
      </LegalSection>
      <LegalSection title="Paiement">
        <p>
          Les moyens affichés au paiement sont le paiement en ligne via CinetPay
          et le paiement à la livraison. La disponibilité de chaque moyen dépend
          de la commande et de la zone desservie. Pour un paiement en ligne, le
          client est redirigé vers le prestataire de paiement.
        </p>
      </LegalSection>
      <LegalSection title="Livraison">
        <p>
          Zones desservies : <strong>[à compléter]</strong>. Frais :{" "}
          <strong>[montants ou méthode de calcul à compléter]</strong>. Délais
          annoncés : <strong>[délais réalistes à compléter]</strong>. Le client
          vérifie l’adresse et le numéro de téléphone fournis. Les modalités en
          cas d’échec de livraison ou d’adresse erronée sont :{" "}
          <strong>[à compléter]</strong>.
        </p>
      </LegalSection>
      <LegalSection title="Réclamations, retours et remboursements">
        <p>
          Pour une réclamation, contactez{" "}
          <strong>[adresse e-mail et téléphone du service client]</strong> en
          indiquant le numéro de commande. Les conditions, délais et frais de
          retour, les cas de remboursement ou d’échange, ainsi que les garanties
          applicables doivent être précisés ici selon la nature des produits et
          le droit ivoirien :{" "}
          <strong>[à compléter et faire valider avant publication]</strong>.
        </p>
      </LegalSection>
      <LegalSection title="Droit applicable et règlement des litiges">
        <p>
          Les présentes conditions relèvent du droit de la Côte d’Ivoire, sous
          réserve des règles impératives de protection des consommateurs. En cas
          de difficulté, le client peut contacter le service client afin de
          rechercher une solution amiable. Les voies de recours applicables
          demeurent ouvertes.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
