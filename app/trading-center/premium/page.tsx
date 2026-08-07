import { alternates } from "@/lib/seo";
import PremiumClient from "./PremiumClient";

export const metadata = {
  title: "Formules — KONEKSYON PAM Trading Center",
  description:
    "Le plan gratuit montre le sens, la confiance et le résultat de chaque signal — de quoi vérifier le système avant de payer. Le Premium ajoute les niveaux en temps réel, les notifications instantanées et le journal de performance.",
  alternates: alternates("/trading-center/premium"),
};

export default function Page() {
  return <PremiumClient />;
}
