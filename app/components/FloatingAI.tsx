"use client";

import { useLang } from "@/lib/LangContext";
import { useState } from "react";

export default function FloatingAI() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const placeholder = lang === "fr"
    ? "Posez une question sur la Bible..."
    : lang === "ht"
    ? "Poze yon kesyon sou Bib la..."
    : "Ask a question about the Bible...";

  const title = lang === "fr"
    ? "Assistant Biblique"
    : lang === "ht"
    ? "Asistan Biblik"
    : "Bible Assistant";

  const subtitle = lang === "fr"
    ? "Posez n'importe quelle question sur la Bible"
    : lang === "ht"
    ? "Poze nenpòt kesyon sou Bib la"
    : "Ask any question about the Bible";

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const q = question.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.answer || "..." }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Erreur. Réessayez." }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Bible Assistant"
      >
        <div className="relative">
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20" />
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-60 blur-sm animate-pulse" />

          {/* Main button */}
          <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 shadow-2xl shadow-amber-300/50 flex items-center justify-center transition-all duration-300 ${open ? "rotate-0 scale-110" : "hover:scale-110"}`}>
            <span className="text-3xl animate-bounce" style={{ animationDuration: "2s" }}>
              {open ? "✕" : "🕊️"}
            </span>
          </div>

          {/* Sparkles */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="absolute -bottom-0.5 -left-1 w-2 h-2 bg-amber-300 rounded-full animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
          <div className="absolute top-0 -left-2 w-2 h-2 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: "2.5s", animationDelay: "1s" }} />
        </div>

        {/* Label */}
        {!open && (
          <div className="absolute bottom-full right-0 mb-2 bg-stone-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            {title} 🕊️
            <div className="absolute top-full right-4 w-2 h-2 bg-stone-900 rotate-45 -mt-1" />
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-3xl">🕊️</span>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-amber-100 text-xs">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <span className="text-4xl block mb-3 animate-bounce" style={{ animationDuration: "2s" }}>🕊️</span>
                <p className="text-stone-500 text-sm">
                  {lang === "fr"
                    ? "Je suis votre assistant biblique. Posez-moi n'importe quelle question !"
                    : lang === "ht"
                    ? "Mwen se asistan biblik ou. Poze m nenpòt kesyon !"
                    : "I'm your Bible assistant. Ask me anything!"}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                  {(lang === "fr"
                    ? ["Qui est Jésus ?", "Psaume 23", "La prière", "Le pardon"]
                    : lang === "ht"
                    ? ["Ki moun Jezi ye ?", "Sòm 23", "Lapriyè", "Padon"]
                    : ["Who is Jesus?", "Psalm 23", "Prayer", "Forgiveness"]
                  ).map((q) => (
                    <button
                      key={q}
                      onClick={() => { setQuestion(q); }}
                      className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "user" ? (
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-amber-500 text-white text-sm leading-relaxed">
                    {msg.text}
                  </div>
                ) : (
                  <div className="max-w-[90%] px-4 py-3 rounded-2xl rounded-bl-md bg-stone-100 text-stone-800">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span>🕊️</span>
                      <span className="text-xs font-bold text-amber-600">{title}</span>
                    </div>
                    <div className="text-[13px] leading-6 whitespace-pre-line">
                      {msg.text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/["«»]/g, "").replace(/\n{3,}/g, "\n\n")}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleAsk} className="border-t border-stone-200 p-3 flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={placeholder}
              className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm bg-stone-50 focus:border-amber-400 focus:outline-none focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-amber-600 transition-colors disabled:opacity-50 shrink-0"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
