"use client";

import { useLang } from "@/lib/LangContext";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Church {
  id: string;
  name: string;
  pastor_name: string;
  description: string;
  join_code: string;
}

interface Post {
  id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
}

export default function ChurchPage() {
  const { lang } = useLang();
  const params = useParams();
  const id = params.id as string;
  const [church, setChurch] = useState<Church | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("annonces");
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("announcement");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      setUploadedUrl(data.url);
      setPostImage(data.url);
    }
    setUploading(false);
  }

  useEffect(() => {
    loadChurch();
  }, [id]);

  async function loadChurch() {
    const res = await fetch(`/api/churches/${id}`);
    const data = await res.json();
    setChurch(data.church);
    setPosts(data.posts || []);
    setLoading(false);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    const res = await fetch(`/api/churches/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: postTitle.trim(), content: postContent.trim(), type: postType }),
    });
    const data = await res.json();
    if (data.post) {
      setPosts([data.post, ...posts]);
      setPostTitle("");
      setPostContent("");
      setShowPostForm(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!church) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">⛪</p>
        <p className="text-stone-500">{lang === "fr" ? "Église non trouvée" : "Church not found"}</p>
        <Link href="/eglise" className="text-blue-500 hover:underline mt-4 block">← {lang === "fr" ? "Retour" : "Back"}</Link>
      </div>
    );
  }

  const tabs = [
    { id: "annonces", icon: "📣", label: lang === "fr" ? "Annonces" : lang === "ht" ? "Anons" : "Announcements" },
    { id: "etudes", icon: "📖", label: lang === "fr" ? "Études" : lang === "ht" ? "Etid" : "Studies" },
    { id: "prieres", icon: "🙏", label: lang === "fr" ? "Prières" : lang === "ht" ? "Lapriyè" : "Prayers" },
    { id: "evenements", icon: "📅", label: lang === "fr" ? "Événements" : lang === "ht" ? "Evènman" : "Events" },
    { id: "jeux", icon: "🎯", label: lang === "fr" ? "Jeux & Concours" : lang === "ht" ? "Jwèt & Konkou" : "Games & Contests" },
  ];

  const typeMap: Record<string, string> = { annonces: "announcement", etudes: "study", prieres: "prayer", evenements: "event", jeux: "game" };
  const filteredPosts = posts.filter((p) => p.type === typeMap[activeTab]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/eglise" className="text-blue-500 text-sm hover:underline mb-6 block">
        ← {lang === "fr" ? "Toutes les églises" : "All churches"}
      </Link>

      {/* Church Header */}
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0f2044] rounded-2xl p-8 mb-8 border border-blue-800/30">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {church.name[0]}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white">{church.name}</h1>
            <p className="text-blue-300/70 text-sm">{church.pastor_name}</p>
            {church.description && <p className="text-blue-200/50 text-sm mt-1">{church.description}</p>}
          </div>
          <div className="sm:ml-auto bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/10">
            <p className="text-blue-300/60 text-xs mb-1">{lang === "fr" ? "Code d'accès" : "Access code"}</p>
            <p className="text-cyan-400 font-mono font-bold text-lg tracking-widest">{church.join_code}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                : "bg-white text-stone-600 border border-stone-200 hover:border-blue-300"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Post Button */}
      <button
        onClick={() => setShowPostForm(!showPostForm)}
        className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left text-blue-600 font-medium hover:bg-blue-100 transition-colors mb-6"
      >
        + {lang === "fr" ? "Publier dans cette section" : lang === "ht" ? "Pibliye nan seksyon sa a" : "Post in this section"}
      </button>

      {/* Post Form */}
      {showPostForm && (
        <form onSubmit={handlePost} className="bg-white rounded-2xl border border-blue-100 p-6 mb-6 shadow-sm">
          <input type="hidden" value={typeMap[activeTab]} onChange={(e) => setPostType(e.target.value)} />
          <input type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder={lang === "fr" ? "Titre..." : "Title..."} required className="w-full border border-stone-300 rounded-xl px-4 py-3 mb-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none font-medium" />
          <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder={lang === "fr" ? "Contenu..." : "Content..."} required rows={4} className="w-full border border-stone-300 rounded-xl px-4 py-3 mb-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none resize-none" />
          <div className="flex flex-col gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">📷 {lang === "fr" ? "Ajouter une image" : "Add an image"}</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-600 font-medium transition-colors">
                  {uploading ? "⏳ Upload..." : "📁 Choisir un fichier"}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {uploadedUrl && <span className="text-green-600 text-xs font-medium">✓ Image ajoutée</span>}
              </div>
              {uploadedUrl && <img src={uploadedUrl} alt="" className="mt-2 w-32 h-32 object-cover rounded-xl border border-stone-200" />}
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">🎬 {lang === "fr" ? "Lien vidéo YouTube (optionnel)" : "YouTube link (optional)"}</label>
              <input type="url" value={postVideo} onChange={(e) => setPostVideo(e.target.value)} placeholder="https://youtube.com/..." className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity text-sm">
            {lang === "fr" ? "Publier" : lang === "ht" ? "Pibliye" : "Publish"}
          </button>
        </form>
      )}

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <p className="text-4xl mb-3">{tabs.find((t) => t.id === activeTab)?.icon}</p>
          <p className="text-stone-500">
            {lang === "fr" ? "Rien ici pour le moment. Soyez le premier à publier !" : "Nothing here yet. Be the first to post!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-stone-900 text-lg mb-2">{post.title}</h3>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">{post.content}</p>
              <p className="text-xs text-stone-400 mt-3">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
