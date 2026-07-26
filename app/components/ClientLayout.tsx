"use client";

import { LangProvider } from "@/lib/LangContext";
import NavBar from "./NavBar";
import FloatingAI from "./FloatingAI";
import ScrollingVerses from "./ScrollingVerses";
import WelcomePopup from "./WelcomePopup";
import Footer from "./Footer";
import GlobalNextStep from "./GlobalNextStep";
import ScrollReveal from "./ScrollReveal";
import SplashScreen from "./SplashScreen";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);

  // Page de diffusion TV : rendu PLEIN ÉCRAN, sans menu / bandeau / pied de page.
  if (pathname === "/championnat/diffusion") {
    return <LangProvider>{children}</LangProvider>;
  }

  useEffect(() => {
    // Only show splash on first visit per browser session
    if (typeof window !== "undefined" && !sessionStorage.getItem("kp_splash_done")) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem("kp_splash_done", "1");
  }, []);

  return (
    <LangProvider>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <ScrollingVerses />
      <ScrollReveal />
      <NavBar />
      <div style={{ paddingTop: 104 }}>
        <main className="flex-1">{children}</main>
        <GlobalNextStep />
        <Footer />
      </div>
      <FloatingAI />
      <WelcomePopup />
    </LangProvider>
  );
}
