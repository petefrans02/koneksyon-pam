"use client";

// Active/désactive les notifications push sur CET appareil.
// L'abonnement est propre à chaque navigateur/téléphone : un même compte peut
// en avoir plusieurs, et le bouton ne reflète que l'appareil en cours.

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useLang } from "@/lib/LangContext";
import Icon from "@/app/components/Icon";

type L = "fr" | "ht" | "en" | "es";

const T: Record<L, Record<string, string>> = {
  fr: {
    title: "Notifications sur cet appareil",
    desc: "Reçois les annonces directement sur ton téléphone, même sans ouvrir le site.",
    on: "Activées sur cet appareil",
    off: "Désactivées sur cet appareil",
    enable: "Activer les notifications",
    disable: "Désactiver",
    test: "Envoyer un test",
    working: "…",
    unsupported: "Ton navigateur ne gère pas les notifications push.",
    denied: "Tu as bloqué les notifications. Autorise-les dans les réglages du navigateur, puis reviens ici.",
    iosHint: "Sur iPhone : appuie sur Partager ⎋ puis « Sur l'écran d'accueil » pour installer l'app — les notifications ne marchent qu'ainsi.",
    othersDevices: "appareil(s) connecté(s) à ton compte",
    testSent: "✅ Test envoyé — tu devrais le voir apparaître.",
    testFail: "❌ Le test n'est pas parti",
    error: "❌ Erreur",
  },
  ht: {
    title: "Notifikasyon sou aparèy sa a",
    desc: "Resevwa anons yo dirèkteman sou telefòn ou, menm san ou pa louvri sit la.",
    on: "Aktive sou aparèy sa a",
    off: "Dezaktive sou aparèy sa a",
    enable: "Aktive notifikasyon yo",
    disable: "Dezaktive",
    test: "Voye yon tès",
    working: "…",
    unsupported: "Navigatè ou a pa sipòte notifikasyon push.",
    denied: "Ou bloke notifikasyon yo. Otorize yo nan paramèt navigatè a, epi retounen isit la.",
    iosHint: "Sou iPhone : peze Pataje ⎋ epi « Sou ekran dakèy la » pou enstale app la — se sèl fason notifikasyon yo mache.",
    othersDevices: "aparèy konekte ak kont ou",
    testSent: "✅ Tès voye — ou ta dwe wè l parèt.",
    testFail: "❌ Tès la pa pati",
    error: "❌ Erè",
  },
  en: {
    title: "Notifications on this device",
    desc: "Get announcements straight on your phone, even without opening the site.",
    on: "Enabled on this device",
    off: "Disabled on this device",
    enable: "Enable notifications",
    disable: "Disable",
    test: "Send a test",
    working: "…",
    unsupported: "Your browser does not support push notifications.",
    denied: "You blocked notifications. Allow them in your browser settings, then come back here.",
    iosHint: "On iPhone: tap Share ⎋ then \"Add to Home Screen\" to install the app — notifications only work that way.",
    othersDevices: "device(s) linked to your account",
    testSent: "✅ Test sent — it should show up now.",
    testFail: "❌ The test did not go out",
    error: "❌ Error",
  },
  es: {
    title: "Notificaciones en este dispositivo",
    desc: "Recibe los anuncios directamente en tu teléfono, incluso sin abrir el sitio.",
    on: "Activadas en este dispositivo",
    off: "Desactivadas en este dispositivo",
    enable: "Activar notificaciones",
    disable: "Desactivar",
    test: "Enviar una prueba",
    working: "…",
    unsupported: "Tu navegador no admite notificaciones push.",
    denied: "Has bloqueado las notificaciones. Permítelas en los ajustes del navegador y vuelve aquí.",
    iosHint: "En iPhone: toca Compartir ⎋ y luego «Añadir a pantalla de inicio» para instalar la app — así funcionan las notificaciones.",
    othersDevices: "dispositivo(s) conectado(s) a tu cuenta",
    testSent: "✅ Prueba enviada — deberías verla aparecer.",
    testFail: "❌ La prueba no salió",
    error: "❌ Error",
  },
};

// Aucune de ces capacités ne change pendant la vie de la page : le store n'a
// donc rien à écouter. La fonction est définie une seule fois (une nouvelle
// référence à chaque rendu ferait se réabonner useSyncExternalStore en boucle).
const NO_SUBSCRIBE = () => () => {};

// La clé publique VAPID voyage en base64url ; l'API navigateur veut un Uint8Array.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function PushToggle() {
  const { lang } = useLang();
  const t = T[(["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as L];

  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [devices, setDevices] = useState(0);

  // Capacités du navigateur : lues via useSyncExternalStore plutôt que dans un
  // effet, pour éviter tout décalage d'hydratation (le serveur ne connaît rien
  // de l'appareil). L'abonnement ne change jamais tout seul → pas d'écoute.
  const supported = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window,
    () => null as boolean | null,
  );
  const isIOS = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    () => false,
  );
  const standalone = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => window.matchMedia("(display-mode: standalone)").matches,
    () => false,
  );

  const refreshDevices = useCallback(async () => {
    try {
      const r = await fetch("/api/push/subscribe");
      const d = await r.json();
      setDevices(d.devices ?? 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!supported) return;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      } catch { /* ignore */ }
      refreshDevices();
    })();
  }, [supported, refreshDevices]);

  async function enable() {
    setBusy(true); setMsg("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setMsg(t.denied); setBusy(false); return; }

      const reg = await navigator.serviceWorker.ready;
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) { setMsg(`${t.error} : clé VAPID absente`); setBusy(false); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      const d = await res.json();
      if (!res.ok) { setMsg(`${t.error} : ${d.error}`); await sub.unsubscribe(); }
      else { setSubscribed(true); refreshDevices(); }
    } catch (e) {
      setMsg(`${t.error} : ${String(e).slice(0, 120)}`);
    }
    setBusy(false);
  }

  async function disable() {
    setBusy(true); setMsg("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      refreshDevices();
    } catch (e) {
      setMsg(`${t.error} : ${String(e).slice(0, 120)}`);
    }
    setBusy(false);
  }

  async function test() {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/push/test", { method: "POST" });
      const d = await r.json();
      setMsg(d.sent > 0 ? t.testSent : `${t.testFail}${d.error ? ` : ${d.error}` : ""}`);
    } catch { setMsg(t.testFail); }
    setBusy(false);
  }

  if (supported === null) return null;

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.2)" }}>
      <h3 className="font-black text-white text-sm mb-1 flex items-center gap-2">
        <Icon name="notifications" size={16} /> {t.title}
      </h3>
      <p className="text-xs text-white/45 mb-4 leading-relaxed">{t.desc}</p>

      {!supported ? (
        <p className="text-xs text-white/40">{t.unsupported}</p>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold" style={{ color: subscribed ? "#4ade80" : "rgba(255,255,255,0.5)" }}>
              {subscribed ? `● ${t.on}` : `○ ${t.off}`}
            </span>
            <div className="flex-1" />
            {subscribed ? (
              <>
                <button onClick={test} disabled={busy}
                  className="px-4 py-2 rounded-full text-xs font-black disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}>
                  {busy ? t.working : t.test}
                </button>
                <button onClick={disable} disabled={busy}
                  className="px-4 py-2 rounded-full text-xs font-black disabled:opacity-50"
                  style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  {t.disable}
                </button>
              </>
            ) : (
              <button onClick={enable} disabled={busy}
                className="px-5 py-2 rounded-full text-xs font-black disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff" }}>
                {busy ? t.working : t.enable}
              </button>
            )}
          </div>

          {devices > 0 && (
            <p className="text-[11px] text-white/30 mt-3">{devices} {t.othersDevices}</p>
          )}
          {/* iOS n'autorise le push que depuis l'app installée sur l'écran d'accueil. */}
          {isIOS && !standalone && (
            <p className="text-[11px] mt-3 leading-relaxed" style={{ color: "#fbbf24" }}>{t.iosHint}</p>
          )}
          {msg && <p className="text-xs mt-3 text-white/70 leading-relaxed">{msg}</p>}
        </>
      )}
    </div>
  );
}
