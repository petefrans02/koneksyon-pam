"use client";

import { LangProvider } from "@/lib/LangContext";
import NavBar from "./NavBar";
import FloatingAI from "./FloatingAI";
import ScrollingVerses from "./ScrollingVerses";
import WelcomePopup from "./WelcomePopup";
import Footer from "./Footer";
import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <NavBar />
      <ScrollingVerses />
      <main className="flex-1">{children}</main>
      <FloatingAI />
      <WelcomePopup />
      <Footer />
    </LangProvider>
  );
}
