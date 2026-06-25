"use client";

import { useLang } from "@/lib/LangContext";
import { groups } from "@/lib/groups-data";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCountry } from "@/lib/useCountry";
import Link from "next/link";

interface Post {
  id: string;
  author_name: string;
  author_country: string;
  title: string;
  content: string;
  likes: number;
  created_at: string;
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function GroupPage() {
  const { lang } = useLang();
  const params = useParams();
  const slug = params.slug as string;
  const group = groups.find((g) => g.slug === slug);
  const userCountry = useCountry();
  const [activeSection, setActiveSection] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (group && !activeSection) setActiveSection(group.sections[0]?.slug || "");
  }, [group, activeSection]);

  useEffect(() => {
    if (slug && activeSection) loadPosts();
  }, [slug, activeSection]);

  async function loadPosts() {
    setLoading(true);
    const res = await fetch(`/api/groups?slug=${slug}&section=${activeSection}`);
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (!user) {
      supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/communaute/${slug}` } });
      return;
    }
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_slug: slug, section_slug: activeSection, author_name: name.trim() || "Anonyme", author_country: userCountry.flag, title: title.trim(), content: content.trim() }),
    });
    setTitle("");
    setContent("");
    setName("");
    setShowForm(false);
    loadPosts();
  }

  if (!group) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">🌍</p>
        <p className="text-stone-500">Groupe non trouvé</p>
        <Link href="/communaute" className="text-blue-500 hover:underline mt-4 block">← Retour</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/communaute" className="text-blue-500 text-sm hover:underline mb-6 block">← {lang === "fr" ? "Communauté" : "Community"}</Link>

      <div className={`bg-gradient-to-br ${group.color} rounded-2xl p-6 mb-8 flex items-center gap-4`}>
        <img src={group.image} alt="" className="w-14 h-14 drop-shadow-lg" />
        <div>
          <h1 className="text-2xl font-bold text-white">{group.title[lang] || group.title.fr}</h1>
          <p className="text-white/70 text-sm">{group.description[lang] || group.description.fr}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {group.sections.map((s) => (
          <button
            key={s.slug}
            onClick={() => setActiveSection(s.slug)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === s.slug
                ? `bg-gradient-to-r ${group.color} text-white shadow-md`
                : "bg-white text-stone-600 border border-stone-200 hover:border-blue-300"
            }`}
          >
            <span>{s.icon}</span> {s.title[lang] || s.title.fr}
          </button>
        ))}
      </div>

      <button
        onClick={() => { if (!user) { supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/communaute/${slug}` } }); return; } setShowForm(!showForm); }}
        className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left text-blue-600 font-medium hover:bg-blue-100 transition-colors mb-6"
      >
        + {lang === "fr" ? "Publier dans ce groupe" : "Post in this group"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 p-6 mb-6 shadow-sm">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "fr" ? "Votre nom..." : "Your name..."} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none" />
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={lang === "fr" ? "Titre..." : "Title..."} required className="w-full border border-stone-300 rounded-xl px-4 py-3 mb-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none font-medium" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={lang === "fr" ? "Contenu..." : "Content..."} required rows={4} className="w-full border border-stone-300 rounded-xl px-4 py-3 mb-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none resize-none" />
          <button type="submit" className={`bg-gradient-to-r ${group.color} text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity text-sm`}>
            {lang === "fr" ? "Publier" : "Publish"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <p className="text-4xl mb-3">{group.sections.find((s) => s.slug === activeSection)?.icon || "📝"}</p>
          <p className="text-stone-500">{lang === "fr" ? "Rien ici pour le moment. Soyez le premier à publier !" : "Nothing here yet. Be the first to post!"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{post.author_country}</span>
                <span className="font-semibold text-stone-900">{post.author_name}</span>
                <span className="text-stone-400 text-xs">· {timeAgo(post.created_at)}</span>
              </div>
              <h3 className="font-bold text-stone-900 text-lg mb-2">{post.title}</h3>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
