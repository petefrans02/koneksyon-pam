import { alternates } from "@/lib/seo";
import JournalClient from "./JournalClient";

export const metadata = {
  title: "Mon relevé — ce qui marche vraiment chez moi",
  description:
    "Note tes trades et vois ton taux de réussite réel par durée d'expiration, comparé au seuil de rentabilité de ton payout. Assez de trades, et les impressions deviennent des faits.",
  alternates: alternates("/trading/journal"),
};

export default function Page() {
  return <JournalClient />;
}
