"use client";

import { useLang } from "@/lib/LangContext";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Church {
  id: string;
  name: string;
  pastor_name: string;
  description: string;
  join_code: string;
  logo_url?: string;
  owner_user_id?: string;
}

interface Post {
  id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  author_id?: string;
}

interface JoinRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string;
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
  const [subgroups, setSubgroups] = useState<{ id: string; name: string; icon: string; description: string }[]>([]);
  const [showSubgroupForm, setShowSubgroupForm] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubIcon, setNewSubIcon] = useState("📋");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [memberDeptId, setMemberDeptId] = useState<string | null | undefined>(undefined);
  const [joiningDeptId, setJoiningDeptId] = useState<string | null>(null);

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
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
    loadChurch();
  }, [id]);

  useEffect(() => {
    if (!currentUserId) return;
    fetch(`/api/churches/memberships?church_id=${id}`)
      .then(r => r.json())
      .then(d => setMemberDeptId(d.membership?.department_id ?? null));
  }, [id, currentUserId]);

  async function loadChurch() {
    const res = await fetch(`/api/churches/${id}`);
    const data = await res.json();
    setChurch(data.church);
    setPosts(data.posts || []);
    setLoading(false);
    const sgRes = await fetch(`/api/churches/subgroups?church_id=${id}`);
    const sgData = await sgRes.json();
    setSubgroups(sgData.subgroups || []);
  }

  async function loadJoinRequests() {
    const res = await fetch(`/api/churches/requests?church_id=${id}`);
    const data = await res.json();
    setJoinRequests(data.requests || []);
  }

  async function respondToRequest(requestId: string, action: "approved" | "rejected") {
    setRespondingId(requestId);
    await fetch("/api/churches/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId, church_id: id, action }),
    });
    setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    setRespondingId(null);
  }

  const isOwner = church?.owner_user_id && currentUserId && church.owner_user_id === currentUserId;
  const isEglise = church?.description?.includes("[⛪") || church?.description?.includes("[🏛");

  async function joinDepartment(deptId: string) {
    setJoiningDeptId(deptId);
    const res = await fetch("/api/churches/memberships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ church_id: id, department_id: deptId }),
    });
    const result = await res.json();
    if (result.ok) {
      // Confirm from server that it was actually saved
      const verify = await fetch(`/api/churches/memberships?church_id=${id}`);
      const verifyData = await verify.json();
      setMemberDeptId(verifyData.membership?.department_id ?? deptId);
    }
    setJoiningDeptId(null);
  }

  async function createSubgroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubName.trim()) return;
    await fetch("/api/churches/subgroups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ church_id: id, name: newSubName.trim(), icon: newSubIcon }),
    });
    setNewSubName("");
    setShowSubgroupForm(false);
    const sgRes = await fetch(`/api/churches/subgroups?church_id=${id}`);
    const sgData = await sgRes.json();
    setSubgroups(sgData.subgroups || []);
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
        <p className="text-stone-500">{lang === "fr" ? "Église non trouvée" : lang === "ht" ? "Legliz pa jwenn" : "Church not found"}</p>
        <Link href="/eglise" className="text-blue-500 hover:underline mt-4 block">← {lang === "fr" ? "Retour" : lang === "ht" ? "Tounen" : "Back"}</Link>
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
        ← {lang === "fr" ? "Toutes les églises" : lang === "ht" ? "Tout legliz yo" : "All churches"}
      </Link>

      {/* Church Header */}
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0f2044] rounded-2xl p-8 mb-8 border border-blue-800/30">
        {(() => {
          const raw = church.description || "";
          // Strip any leading/trailing brackets variants: [content] or [content] — desc
          const typeMatch = raw.match(/^\[([^\]]+)\](?:\s*[—-]\s*(.*))?$/) || raw.match(/^([^[—\n]+?)(?:\s*[—-]\s*(.*))?$/);
          const hasBracket = raw.startsWith("[");
          const typeTag = hasBracket && typeMatch ? typeMatch[1].trim() : "";
          const descText = hasBracket && typeMatch ? (typeMatch[2] || "").trim() : raw;
          return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl shrink-0 overflow-hidden border-2 border-white/20 shadow-xl">
            {church.logo_url ? (
              <img src={church.logo_url} alt={church.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-black">
                {church.name[0]}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-black text-white uppercase tracking-wide leading-tight">{church.name}</h1>
            {typeTag && (
              <span className="inline-flex items-center gap-1 text-xs text-cyan-300 bg-white/10 border border-white/20 rounded-full px-3 py-1 mt-2 font-medium">
                {typeTag}
              </span>
            )}
            {church.pastor_name && (
              <p className="text-blue-300/50 text-xs mt-2 uppercase tracking-widest">{lang === "fr" ? "Responsable" : lang === "ht" ? "Responsab" : "Leader"} · {church.pastor_name}</p>
            )}
            {descText && <p className="text-blue-200/40 text-xs mt-1 leading-relaxed">{descText}</p>}
          </div>
          <div className="sm:ml-auto flex flex-col gap-2">
            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl px-5 py-4 text-center border border-white/20 shadow-inner">
              <p className="text-blue-300/50 text-xs mb-1.5 uppercase tracking-[0.2em] font-medium">{lang === "fr" ? "Code d'accès" : lang === "ht" ? "Kòd aksè" : "Access code"}</p>
              <p className="text-white font-mono font-black text-2xl tracking-[0.35em]">{church.join_code}</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {church.join_code.split("").map((c, i) => (
                  <span key={i} className="w-1 h-1 rounded-full bg-cyan-400/40 inline-block" />
                ))}
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => { setShowRequests(!showRequests); if (!showRequests) loadJoinRequests(); }}
                className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 justify-center"
              >
                🔔 {lang === "fr" ? "Demandes d'adhésion" : "Join requests"}
              </button>
            )}
          </div>
        </div>
          );
        })()}
      </div>

      {/* Join Requests Panel — owner only */}
      {isOwner && showRequests && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-amber-900 mb-4">
            🔔 {lang === "fr" ? "Demandes en attente" : "Pending requests"}
            {joinRequests.length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{joinRequests.length}</span>
            )}
          </h2>
          {joinRequests.length === 0 ? (
            <p className="text-amber-700/60 text-sm">{lang === "fr" ? "Aucune demande en attente" : "No pending requests"}</p>
          ) : (
            <div className="space-y-3">
              {joinRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl p-4 border border-amber-200 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                    {req.user_avatar ? (
                      <img src={req.user_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (req.user_name || "?")[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 text-sm">{req.user_name || "Anonyme"}</p>
                    <p className="text-stone-400 text-xs">{req.user_email}</p>
                    <p className="text-stone-400 text-xs">{new Date(req.created_at).toLocaleDateString("fr")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => respondToRequest(req.id, "approved")}
                      disabled={respondingId === req.id}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      {respondingId === req.id ? "..." : lang === "fr" ? "✓ Accepter" : "✓ Accept"}
                    </button>
                    <button
                      onClick={() => respondToRequest(req.id, "rejected")}
                      disabled={respondingId === req.id}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-red-200"
                    >
                      {lang === "fr" ? "✗ Refuser" : "✗ Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Départements */}
      {(subgroups.length > 0 || (isOwner && isEglise)) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-stone-900">
              {lang === "fr" ? "Départements" : lang === "ht" ? "Depatman" : "Departments"}
            </h2>
            {isOwner && isEglise && (
              <button onClick={() => setShowSubgroupForm(!showSubgroupForm)} className="text-blue-500 text-sm font-medium hover:underline">
                + {lang === "fr" ? "Ajouter" : lang === "ht" ? "Ajoute" : "Add"}
              </button>
            )}
          </div>

          {/* Owner: add dept form */}
          {isOwner && isEglise && showSubgroupForm && (
            <form onSubmit={createSubgroup} className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3 flex gap-2">
              <select value={newSubIcon} onChange={(e) => setNewSubIcon(e.target.value)} className="border border-stone-300 rounded-lg px-2 py-2 text-lg bg-white">
                {["🎵", "🔥", "👩", "👨", "🙏", "🌍", "💼", "👶", "📖", "📋", "💬", "🎤"].map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <input type="text" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder={lang === "fr" ? "Nom du département..." : lang === "ht" ? "Non depatman..." : "Department name..."} required className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500">OK</button>
            </form>
          )}

          {/* Member: dept picker banner (shown when member has no dept yet) */}
          {!isOwner && currentUserId && subgroups.length > 0 && memberDeptId === null && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5 mb-4">
              <p className="font-bold text-blue-900 mb-1">
                {lang === "fr" ? "👇 Choisissez votre département" : lang === "ht" ? "👇 Chwazi depatman ou" : "👇 Choose your department"}
              </p>
              <p className="text-blue-700 text-sm mb-1">
                {lang === "fr" ? "Sélectionnez le département auquel vous appartenez dans cette église." : lang === "ht" ? "Chwazi depatman ou ap fè parti nan legliz sa a." : "Select the department you belong to in this church."}
              </p>
            </div>
          )}

          {/* Member: current dept */}
          {!isOwner && currentUserId && memberDeptId && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
              <span className="text-green-600 font-bold text-sm">✓ {lang === "fr" ? "Votre département :" : lang === "ht" ? "Depatman ou :" : "Your department:"}</span>
              <span className="font-bold text-green-800">{subgroups.find(s => s.id === memberDeptId)?.icon} {subgroups.find(s => s.id === memberDeptId)?.name}</span>
              <button onClick={() => setMemberDeptId(null)} className="ml-auto text-xs text-stone-400 hover:text-stone-600 underline">
                {lang === "fr" ? "Changer" : lang === "ht" ? "Chanje" : "Change"}
              </button>
            </div>
          )}

          {/* Dept cards — clickable for members, display-only for owner */}
          {subgroups.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subgroups.map((sg) => {
                const isMyDept = memberDeptId === sg.id;
                const isLoading = joiningDeptId === sg.id;
                if (isOwner) {
                  return (
                    <div key={sg.id} className="bg-white border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                      <span className="text-xl">{sg.icon}</span>
                      <span className="text-sm font-medium text-stone-700">{sg.name}</span>
                    </div>
                  );
                }
                return (
                  <button
                    key={sg.id}
                    onClick={() => joinDepartment(sg.id)}
                    disabled={isLoading || isMyDept}
                    className={`rounded-xl px-4 py-3 flex items-center gap-2 transition-all text-left border-2 ${
                      isMyDept
                        ? "bg-green-50 border-green-400 shadow-md shadow-green-100"
                        : "bg-white border-stone-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
                    }`}
                  >
                    <span className="text-xl">{isLoading ? "⏳" : sg.icon}</span>
                    <span className={`text-sm font-medium ${isMyDept ? "text-green-800" : "text-stone-700"}`}>{sg.name}</span>
                    {isMyDept && <span className="ml-auto text-green-500 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

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
            {lang === "fr" ? "Rien ici pour le moment. Soyez le premier à publier !" : lang === "ht" ? "Pa gen anyen isit pou kounye a. Soyez premye a pibliye !" : "Nothing here yet. Be the first to post!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md transition-shadow">
              {/* Author row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (post.author_name || "?")[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">{post.author_name || "Anonyme"}</p>
                  <p className="text-xs text-stone-400">{new Date(post.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
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
