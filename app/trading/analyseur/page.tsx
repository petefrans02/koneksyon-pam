import { alternates } from "@/lib/seo";
import AnalyseurClient from "./AnalyseurClient";

export const metadata = {
  title: "Analyseur de graphique (IA) — Académie Trading",
  description:
    "Envoie une capture d'écran d'un graphique en bougies : l'IA lit chaque bougie récente et explique quelle décision elle en tirerait. Outil pédagogique.",
  alternates: alternates("/trading/analyseur"),
};

export default function Page() {
  return <AnalyseurClient />;
}
