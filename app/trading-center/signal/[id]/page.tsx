import SignalClient from "./SignalClient";

/**
 * Un signal n'est pas une page à indexer.
 *
 * `noindex` sur toute la section : son contenu est réservé aux abonnés,
 * périmé en quelques heures, et un moteur qui l'indexerait servirait des
 * niveaux d'entrée obsolètes à des visiteurs qui les prendraient pour actuels.
 */
export const metadata = {
  title: "Signal — KONEKSYON PAM Trading Center",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SignalClient id={id} />;
}
