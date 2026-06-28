"use client";

import { useEffect } from "react";
import Link from "next/link";
import { analytics } from "@/lib/analytics";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[KP Error]", error.digest ?? error.message);
    analytics.error(error.message, error.digest, window.location.pathname);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-black text-white mb-3">Une erreur est survenue</h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Quelque chose s'est mal passé. Cela ne devrait pas arriver — veuillez réessayer.
          {error.digest && (
            <span className="block mt-2 font-mono text-[10px] text-white/20">
              Ref: {error.digest}
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="bg-white/10 hover:bg-white/15 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
