import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à KONEKSYON PAM avec votre compte Google. Authentification sécurisée via OAuth 2.0 — aucun mot de passe collecté.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
