import { alternates } from "@/lib/seo";
import AcademieTradingClient from "./AcademieTradingClient";

export const metadata = {
  title: "Académie Trading — Apprends à lire le marché",
  description:
    "Dix niveaux, des fondations à l'analyse autonome. Exercices interactifs sur bougies, progression par compétences validées. Contenu éducatif.",
  alternates: alternates("/trading"),
};

export default function Page() {
  return <AcademieTradingClient />;
}
