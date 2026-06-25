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
      <footer className="bg-gradient-to-b from-[#0a1628] to-[#060e1a] px-6 py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-8 left-1/4 w-40 h-40 bg-blue-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-8 right-1/4 w-32 h-32 bg-cyan-500 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1 border border-blue-400/20">
              <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
            </div>
          </div>
          <p className="text-center text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-1">KONEKSYON PAM</p>
          <p className="text-center text-[10px] tracking-[0.3em] text-cyan-500/40 mb-8 uppercase">Une Mission • Un Dieu • Une Vision</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-blue-300 text-sm font-bold mb-3">Adoration</h4>
              <a href="/bible" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">📖 Bible</a>
              <a href="/psaumes" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">🎶 Psaumes</a>
              <a href="/chants" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">🎵 Chants d'Espérance</a>
            </div>
            <div>
              <h4 className="text-blue-300 text-sm font-bold mb-3">Prière</h4>
              <a href="/prieres" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">🙏 Demandes</a>
              <a href="/temoignages" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">✨ Témoignages</a>
            </div>
            <div>
              <h4 className="text-blue-300 text-sm font-bold mb-3">Apprendre</h4>
              <a href="/etude" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">📚 Études</a>
              <a href="/quiz" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">🏆 Quiz</a>
            </div>
            <div>
              <h4 className="text-blue-300 text-sm font-bold mb-3">Communauté</h4>
              <a href="/communaute" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">🌍 Groupes</a>
              <a href="/eglise" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">⛪ Église</a>
              <a href="/apropos" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">À propos</a>
              <a href="/contact" className="block text-blue-400/50 hover:text-cyan-300 text-sm mb-2 transition-colors">Contact</a>
              <a href="/don" className="block text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">💝 Faire un don</a>
            </div>
          </div>

          <div className="border-t border-blue-800/30 pt-5">
            <p className="text-center text-sm text-blue-300/40">Connectés par la foi • Konekte pa lafwa • Connected by faith</p>
            <p className="text-center text-xs text-blue-400/25 mt-2">&copy; {new Date().getFullYear()} KONEKSYON PAM — Pasteur P. Francis</p>
          </div>
        </div>
      </footer>
    </LangProvider>
  );
}
