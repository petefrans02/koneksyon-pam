import { alternates } from "@/lib/seo";
import BreakoutDrillClient from "./BreakoutDrillClient";

export const metadata = {
  title: "Vraie ou fausse cassure — Académie Trading",
  description:
    "Le niveau a été franchi, mais la cassure tient-elle ? Apprends à juger sur la clôture et à reconnaître un balayage de stops.",
  alternates: alternates("/trading/cassures"),
};

export default function Page() {
  return <BreakoutDrillClient />;
}
