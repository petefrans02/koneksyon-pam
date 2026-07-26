"use client";

import { useLang } from "@/lib/LangContext";
import { useEffect, useRef, useState } from "react";
import Icon from "@/app/components/Icon";

export default function FloatingAI() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const title = lang === "fr" ? "Assistant Biblique" : lang === "ht" ? "Asistan Biblik" : lang === "es" ? "Asistente Bíblico" : "Bible Assistant";
  const subtitle = lang === "fr" ? "Posez n'importe quelle question sur la Bible" : lang === "ht" ? "Poze nenpòt kesyon sou Bib la" : lang === "es" ? "Haz cualquier pregunta sobre la Biblia" : "Ask any question about the Bible";
  const placeholder = lang === "fr" ? "Posez une question…" : lang === "ht" ? "Poze yon kesyon…" : lang === "es" ? "Haz una pregunta…" : "Ask a question…";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const q = question.trim();
    setMessages(m => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "ai", text: data.answer || "…" }]);
    } catch {
      setMessages(m => [...m, { role: "ai", text: lang === "fr" ? "Erreur. Réessayez." : lang === "es" ? "Error. Inténtalo de nuevo." : "Error. Try again." }]);
    }
    setLoading(false);
  }

  const suggestions = lang === "fr"
    ? ["Qui est Jésus ?", "Psaume 23", "La prière", "Le pardon"]
    : lang === "ht"
    ? ["Ki moun Jezi ye ?", "Sòm 23", "Lapriyè", "Padon"]
    : lang === "es"
    ? ["¿Quién es Jesús?", "Salmo 23", "La oración", "El perdón"]
    : ["Who is Jesus?", "Psalm 23", "Prayer", "Forgiveness"];

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={title}
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-amber-400/20"
          style={{
            background: open
              ? "linear-gradient(135deg, #c5a84f, #d4b85c)"
              : "linear-gradient(135deg, #0a1628, #0f2044)",
            border: "1.5px solid rgba(197,168,79,0.45)",
            boxShadow: open
              ? "0 8px 32px rgba(197,168,79,0.30)"
              : "0 8px 24px rgba(0,0,0,0.50)",
          }}
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2L16 16M16 2L2 16" stroke="#030918" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="#c5a84f" strokeWidth="1.5" />
              <path d="M12 7v5l3 3" stroke="#c5a84f" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="1.5" fill="#c5a84f" />
              <path d="M8.5 8.5C9.5 7 11 6 12 6c2.5 0 4.5 2 4.5 4.5 0 2-1.5 3.5-3 4.5H9" stroke="#c5a84f" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Tooltip */}
        {!open && (
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-[#0a1628] border border-amber-400/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg">
              {title}
            </div>
          </div>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          className="fixed bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[360px] flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            background: "#070e1e",
            border: "1px solid rgba(197,168,79,0.18)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(197,168,79,0.08)",
            maxHeight: "min(500px, 70vh)",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5"
            style={{ background: "linear-gradient(135deg, #0a1628, #0f2044)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(197,168,79,0.12)", border: "1px solid rgba(197,168,79,0.25)" }}>
              <Icon name="croix" size={18} color="#c5a84f" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-black text-sm">{title}</h3>
              <p className="text-white/30 text-[10px] truncate">{subtitle}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "rgba(197,168,79,0.10)", border: "1px solid rgba(197,168,79,0.20)" }}>
                  <Icon name="bible" size={24} color="#c5a84f" />
                </div>
                <p className="text-white/30 text-xs leading-5 mb-4">
                  {lang === "fr" ? "Posez-moi n'importe quelle question sur la Bible."
                   : lang === "ht" ? "Poze m nenpòt kesyon sou Bib la."
                   : lang === "es" ? "Hazme cualquier pregunta sobre la Biblia."
                   : "Ask me anything about the Bible."}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {suggestions.map(q => (
                    <button key={q} onClick={() => setQuestion(q)}
                      className="text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors"
                      style={{ background: "rgba(197,168,79,0.08)", border: "1px solid rgba(197,168,79,0.20)", color: "rgba(197,168,79,0.80)" }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "user" ? (
                  <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed"
                    style={{ background: "linear-gradient(135deg, #c5a84f, #d4b85c)", color: "#030918" }}>
                    {msg.text}
                  </div>
                ) : (
                  <div className="max-w-[90%] px-4 py-3 rounded-2xl rounded-bl-sm"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[10px] font-black text-amber-400/60 mb-1.5 uppercase tracking-wider inline-flex items-center gap-1"><Icon name="croix" size={12} /> {title}</p>
                    <div className="text-white/70 text-[13px] leading-6 whitespace-pre-line">
                      {msg.text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/["«»]/g, "").replace(/\n{3,}/g, "\n\n")}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex gap-1.5 items-center">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce"
                        style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleAsk} className="flex gap-2 p-3 border-t border-white/5">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button type="submit" disabled={loading || !question.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
              style={{ background: "linear-gradient(135deg, #c5a84f, #d4b85c)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 12V2M2 7l5-5 5 5" stroke="#030918" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
