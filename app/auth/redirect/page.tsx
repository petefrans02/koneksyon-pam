"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const dest = localStorage.getItem("authRedirect") || "/";
    localStorage.removeItem("authRedirect");
    router.replace(dest);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0f2044] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Connexion en cours...</p>
      </div>
    </div>
  );
}
