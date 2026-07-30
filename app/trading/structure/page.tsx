import { alternates } from "@/lib/seo";
import StructureDrillClient from "./StructureDrillClient";

export const metadata = {
  title: "Lire la structure — Académie Trading",
  description:
    "Haussière, baissière ou range ? Lis la structure d'un graphique, puis découvre les pivots et les étiquettes HH/HL/LH/LL qui donnent la réponse.",
  alternates: alternates("/trading/structure"),
};

export default function Page() {
  return <StructureDrillClient />;
}
