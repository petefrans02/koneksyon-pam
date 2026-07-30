import { alternates } from "@/lib/seo";
import MomentumDrillClient from "./MomentumDrillClient";

// Route « tempo » et non « momentum » : ce dernier est déjà le slug du niveau 5,
// et une route statique prend le pas sur la route dynamique [niveau] — le drill
// masquerait la page du niveau.
export const metadata = {
  title: "Où va le momentum — Académie Trading",
  description:
    "Accélération, essoufflement, ou agitation sans progression ? Confronte ton impression aux trois mesures du momentum.",
  alternates: alternates("/trading/tempo"),
};

export default function Page() {
  return <MomentumDrillClient />;
}
