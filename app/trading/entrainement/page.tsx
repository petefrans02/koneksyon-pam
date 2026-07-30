import { alternates } from "@/lib/seo";
import DrillClient from "./DrillClient";

export const metadata = {
  title: "Entraînement — Que va faire le marché ensuite ?",
  description:
    "Lis un graphique, parie sur la suite, découvre ce qui s'est réellement passé. Des exercices illimités pour apprendre à lire les bougies.",
  alternates: alternates("/trading/entrainement"),
};

export default function Page() {
  return <DrillClient />;
}
