import { alternates } from "@/lib/seo";
import TradingCenterClient from "./TradingCenterClient";

/**
 * La description SEO dit ce que le produit REFUSE de faire.
 *
 * « Peu de signaux, très sélectifs » est un argument commercial faible sur le
 * papier et un argument de confiance très fort en pratique — c'est ce qui
 * distingue cette page des milliers de canaux qui promettent « 95 % de
 * réussite, 20 signaux par jour ». Autant que ce soit dit dès le résultat de
 * recherche : ça filtre les visiteurs qui cherchent du volume, et ceux-là ne
 * resteront de toute façon pas.
 */
export const metadata = {
  title: "Trading Center — Signaux XAU/USD à haute probabilité",
  description:
    "Analyse continue de l'or sur sept échelles de temps. Un signal n'est publié qu'au-delà de 90 % de confiance : peu de signaux, très sélectifs. Entrée, stop, objectifs et explication complète. Analyse de marché, pas un conseil en investissement.",
  alternates: alternates("/trading-center"),
};

export default function Page() {
  return <TradingCenterClient />;
}
