"use client";

import { LangProvider } from "@/lib/LangContext";
import NavBar from "./NavBar";
import FloatingAI from "./FloatingAI";
import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <NavBar />
      <main className="flex-1">{children}</main>
      <FloatingAI />
      <footer className="bg-stone-900 text-stone-400 px-6 py-8 text-center text-sm">
        <p className="text-amber-500 font-semibold mb-1">KONEKSYON PAM</p>
        <p>Connectés par la foi • Konekte pa lafwa • Connected by faith</p>
        <p className="mt-2">&copy; {new Date().getFullYear()} KONEKSYON PAM — Pasteur P. Francis</p>
      </footer>
    </LangProvider>
  );
}
