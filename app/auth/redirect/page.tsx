"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";

export default function AuthRedirect() {
  const router = useRouter();
  const { lang } = useLang();

  useEffect(() => {
    const dest = localStorage.getItem("authRedirect") || "/";
    localStorage.removeItem("authRedirect");
    router.replace(dest);
  }, [router]);

  const msg = lang === "ht" ? "Ap konekte..." : lang === "en" ? "Signing in..." : "Connexion en cours...";

  return (
    <div className="min-h-screen bg-[#0f2044] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 text-sm">{msg}</p>
      </div>
    </div>
  );
}
