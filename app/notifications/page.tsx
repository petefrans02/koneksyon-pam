"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Lang = "fr" | "ht" | "en";

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

interface Prefs {
  email_contests: boolean;
  email_prayers: boolean;
  email_studies: boolean;
  email_announcements: boolean;
  email_news: boolean;
  push_contests: boolean;
  push_prayers: boolean;
  push_studies: boolean;
  push_announcements: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  contest: "🏆", prayer: "🙏", testimony: "✨", study: "📖", announcement: "📣",
};

export default function NotificationsPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "prefs">("list");
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const t = {
    fr: {
      title: "Centre de notifications",
      all: "Tout", unread: "Non lues",
      markAll: "Tout marquer comme lu",
      empty: "Aucune notification",
      emptyUnread: "Aucune notification non lue",
      prefs: "Préférences",
      notifications: "Notifications",
      emailSection: "Emails",
      pushSection: "Notifications sur le site",
      save: "Enregistrer",
      saved: "Sauvegardé ✓",
      prefLabels: {
        email_contests: "Concours bibliques",
        email_prayers: "Demandes de prière",
        email_studies: "Nouvelles études",
        email_announcements: "Annonces importantes",
        email_news: "Nouveautés de la plateforme",
        push_contests: "Nouveaux concours",
        push_prayers: "Activité sur mes prières",
        push_studies: "Nouvelles études bibliques",
        push_announcements: "Annonces importantes",
      },
      signIn: "Connectez-vous pour voir vos notifications",
    },
    ht: {
      title: "Sant notifikasyon",
      all: "Tout", unread: "Pa li",
      markAll: "Make tout kòm li",
      empty: "Pa gen notifikasyon",
      emptyUnread: "Pa gen notifikasyon pou li",
      prefs: "Preferans",
      notifications: "Notifikasyon",
      emailSection: "Imèl",
      pushSection: "Notifikasyon sou sit la",
      save: "Anrejistre",
      saved: "Anrejistre ✓",
      prefLabels: {
        email_contests: "Konkou biblik",
        email_prayers: "Demann lapriyè",
        email_studies: "Nouvo etid",
        email_announcements: "Anons enpòtan",
        email_news: "Nouvo bagay sou platfòm lan",
        push_contests: "Nouvo konkou",
        push_prayers: "Aktivite sou lapriyè m yo",
        push_studies: "Nouvo etid biblik",
        push_announcements: "Anons enpòtan",
      },
      signIn: "Konekte pou wè notifikasyon ou yo",
    },
    en: {
      title: "Notification center",
      all: "All", unread: "Unread",
      markAll: "Mark all as read",
      empty: "No notifications",
      emptyUnread: "No unread notifications",
      prefs: "Preferences",
      notifications: "Notifications",
      emailSection: "Emails",
      pushSection: "Site notifications",
      save: "Save",
      saved: "Saved ✓",
      prefLabels: {
        email_contests: "Biblical contests",
        email_prayers: "Prayer requests",
        email_studies: "New studies",
        email_announcements: "Important announcements",
        email_news: "Platform news",
        push_contests: "New contests",
        push_prayers: "Activity on my prayers",
        push_studies: "New Bible studies",
        push_announcements: "Important announcements",
      },
      signIn: "Sign in to see your notifications",
    },
  }[l];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setIsLoggedIn(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    Promise.all([
      fetch("/api/notifications").then(r => r.json()),
      fetch("/api/notifications/preferences").then(r => r.json()),
    ]).then(([notifData, prefsData]) => {
      setNotifications(notifData.notifications || []);
      setPrefs(prefsData.preferences);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isLoggedIn]);

  function getTitle(n: Notification) {
    return (l === "ht" ? n.title_ht : l === "en" ? n.title_en : n.title_fr) || n.title_fr;
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) });
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function savePrefs() {
    if (!prefs) return;
    setSaving(true);
    await fetch("/api/notifications/preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prefs) });
    setSaving(false);
  }

  function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-[#1d4ed8]" : "bg-stone-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    );
  }

  function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return l === "fr" ? "à l'instant" : l === "ht" ? "kounye a" : "just now";
    if (diff < 3600) { const m = Math.floor(diff / 60); return `${m}min`; }
    if (diff < 86400) { const h = Math.floor(diff / 3600); return `${h}h`; }
    return new Date(iso).toLocaleDateString();
  }

  const displayed = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-[#0f2044] px-5 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white font-black text-2xl">{t.title}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {!isLoggedIn ? (
          <div className="text-center py-16 text-stone-400">{t.signIn}</div>
        ) : loading ? (
          <div className="text-center py-16 text-stone-400">...</div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-stone-200 mb-6 gap-1">
              {(["list","prefs"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 ${activeTab === tab ? "border-[#1d4ed8] text-[#1d4ed8]" : "border-transparent text-stone-400 hover:text-stone-600"}`}>
                  {tab === "list" ? t.notifications : t.prefs}
                </button>
              ))}
            </div>

            {activeTab === "list" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    {(["all","unread"] as const).map(f => (
                      <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === f ? "bg-[#0f2044] text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
                        {f === "all" ? t.all : t.unread}
                      </button>
                    ))}
                  </div>
                  {notifications.some(n => !n.read) && (
                    <button onClick={markAllRead} className="text-[#1d4ed8] text-xs font-semibold hover:underline">{t.markAll}</button>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-stone-100 divide-y divide-stone-50 overflow-hidden">
                  {displayed.length === 0 ? (
                    <p className="text-center text-stone-400 text-sm py-12">{filter === "unread" ? t.emptyUnread : t.empty}</p>
                  ) : displayed.map(n => (
                    <div key={n.id}
                      className={`flex gap-3 px-5 py-4 hover:bg-stone-50 cursor-pointer transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}
                      onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link; }}
                    >
                      <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? "📢"}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm leading-snug ${!n.read ? "font-bold text-[#0f2044]" : "font-medium text-stone-700"}`}>{getTitle(n)}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.read && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "prefs" && prefs && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6 flex flex-col gap-8">
                {/* Email prefs */}
                <div>
                  <h3 className="font-black text-[#0f2044] text-sm mb-4">📧 {t.emailSection}</h3>
                  <div className="flex flex-col gap-4">
                    {(["email_contests","email_prayers","email_studies","email_announcements","email_news"] as const).map(key => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-stone-700">{t.prefLabels[key]}</span>
                        <Toggle checked={prefs[key]} onChange={v => setPrefs(p => p ? { ...p, [key]: v } : p)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push prefs */}
                <div>
                  <h3 className="font-black text-[#0f2044] text-sm mb-4">🔔 {t.pushSection}</h3>
                  <div className="flex flex-col gap-4">
                    {(["push_contests","push_prayers","push_studies","push_announcements"] as const).map(key => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-stone-700">{t.prefLabels[key]}</span>
                        <Toggle checked={prefs[key]} onChange={v => setPrefs(p => p ? { ...p, [key]: v } : p)} />
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={savePrefs} disabled={saving}
                  className="self-start bg-[#0f2044] hover:bg-[#1d4ed8] text-white font-black text-sm px-6 py-2.5 rounded-full transition-colors disabled:opacity-50">
                  {saving ? t.saved : t.save}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
