import { alternates } from "@/lib/seo";
import AnalyseChartClient from "./AnalyseChartClient";

export const metadata = {
  title: "Analyser mon graphique — achat ou vente ?",
  description:
    "Envoie une capture de ton graphique en bougies. L'analyse lit la tendance, la structure, les figures et le momentum, puis conclut : achat, vente ou attendre — avec son invalidation.",
  alternates: alternates("/trading/analyse"),
};

export default function Page() {
  return <AnalyseChartClient />;
}
