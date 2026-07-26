"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "@/lib/LangContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

interface Notification {
  id: string;
  type: string;
  title_fr: string;
  title_ht: string;
  title_en: string;
  body_fr: string;
  body_ht: string;
  body_en: string;
  link: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, IconName> = {
  contest: "trophee",
  prayer: "priere",
  testimony: "temoignages",
  study: "etude",
  announcement: "notifications",
};

export default function NotificationCenter() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const labels = {
    fr: { title: "Notifications", markAll: "Tout marquer comme lu", empty: "Aucune notification", viewAll: "Voir tout", loading: "" },
    ht: { title: "Notifikasyon", markAll: "Make tout kòm li", empty: "Pa gen notifikasyon", viewAll: "Wè tout", loading: "" },
    en: { title: "Notifications", markAll: "Mark all as read", empty: "No notifications", viewAll: "View all", loading: "" },
    es: { title: "Notificaciones", markAll: "Marcar todo como leído", empty: "Sin notificaciones", viewAll: "Ver todo", loading: "" },
  }[l];

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {}
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) { setIsLoggedIn(true); load(); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setIsLoggedIn(true); load(); }
      else { setIsLoggedIn(false); setNotifications([]); setUnread(0); }
    });
    return () => subscription.unsubscribe();
  }, [load]);

  // Poll every 60s when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [isLoggedIn, load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    setNotifications(n => n.map(notif => ({ ...notif, read: true })));
    setUnread(0);
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) });
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    setUnread(u => Math.max(0, u - 1));
  }

  function getTitle(n: Notification): string {
    return (l === "ht" ? n.title_ht : l === "es" || l === "en" ? n.title_en : n.title_fr) || n.title_fr;
  }

  function timeAgo(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return l === "fr" ? "à l'instant" : l === "ht" ? "kounye a" : l === "es" ? "ahora mismo" : "just now";
    if (diff < 3600) { const m = Math.floor(diff / 60); return l === "fr" ? `il y a ${m}min` : l === "ht" ? `${m}min` : l === "es" ? `hace ${m}min` : `${m}m ago`; }
    if (diff < 86400) { const h = Math.floor(diff / 3600); return l === "fr" ? `il y a ${h}h` : l === "ht" ? `${h}h` : l === "es" ? `hace ${h}h` : `${h}h ago`; }
    const d = Math.floor(diff / 86400); return l === "fr" ? `il y a ${d}j` : l === "ht" ? `${d}j` : l === "es" ? `hace ${d}d` : `${d}d ago`;
  }

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        className="relative p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        aria-label={labels.title}
      >
        <svg className="w-5 h-5 text-[#1a3568]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="text-[#0f2044] font-black text-sm">{labels.title}</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[#1d4ed8] text-xs font-semibold hover:underline">
                {labels.markAll}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-50">
            {notifications.length === 0 ? (
              <p className="text-center text-stone-400 text-sm py-8">{labels.empty}</p>
            ) : (
              notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer transition-colors ${!n.read ? "bg-blue-50/50" : ""}`}
                  onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link; }}
                >
                  <span className="flex-shrink-0 mt-0.5 text-[#1d4ed8]"><Icon name={TYPE_ICONS[n.type] ?? "notifications"} size={18} /></span>
                  <div className="min-w-0">
                    <p className={`text-xs leading-snug ${!n.read ? "font-bold text-[#0f2044]" : "font-medium text-stone-700"}`}>
                      {getTitle(n)}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 ml-auto" />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-stone-100 px-4 py-2.5 text-center">
            <Link href="/notifications" className="text-[#1d4ed8] text-xs font-semibold hover:underline" onClick={() => setOpen(false)}>
              {labels.viewAll}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
