"use client";

import { LangProvider } from "@/lib/LangContext";
import NavBar from "./NavBar";
import FloatingAI from "./FloatingAI";
import ScrollingVerses from "./ScrollingVerses";
import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <NavBar />
      <ScrollingVerses />
      <main className="flex-1">{children}</main>
      <FloatingAI />
      <footer className="bg-[#0a1628] text-blue-300/50 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-4">
            <img src="/logo-kp.png" alt="KP" className="w-16 h-16 opacity-80" />
          </div>
          <p className="text-center text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-1">KONEKSYON PAM</p>
          <p className="text-center text-xs tracking-widest text-blue-400/40 mb-4">UNE MISSION • UN DIEU • UNE MISSION</p>
          <p className="text-center text-sm text-blue-300/40">Connectés par la foi • Konekte pa lafwa • Connected by faith</p>
          <p className="text-center text-xs text-blue-400/30 mt-4">&copy; {new Date().getFullYear()} KONEKSYON PAM — Pasteur P. Francis</p>
        </div>
      </footer>
    </LangProvider>
  );
}
