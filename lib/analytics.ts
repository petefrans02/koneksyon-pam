// Central analytics module — type-safe, tree-shakeable, easy to extend.
// Usage: import { analytics } from "@/lib/analytics"

// ─── TypeScript global for gtag ──────────────────────────────────────────────
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// ─── Event catalog ────────────────────────────────────────────────────────────
interface EventMap {
  // Navigation
  page_view:             { page_path: string; page_title?: string };
  // Auth
  sign_up:               { method?: string };
  login:                 { method?: string };
  logout:                Record<string, never>;
  // Contests
  contest_register:      { contest_id: string; contest_name?: string };
  contest_start:         { contest_id: string };
  contest_vote:          { contest_id: string; candidate_id?: string };
  contest_end:           { contest_id: string; winner?: string };
  // Community
  prayer_submit:         { category?: string };
  testimony_publish:     { testimony_id?: string };
  // Discovery
  site_search:           { search_term: string };
  language_change:       { language: "fr" | "ht" | "en" | "es"; previous_language?: string };
  // Donations
  donate_click:          { amount?: number };
  donate_paypal_start:   { amount: number };
  donate_paypal_success: { amount: number; capture_id?: string };
  donate_paypal_error:   { error_message?: string };
  // Content
  file_download:         { file_name: string; file_type?: string };
  // Errors
  app_error:             { error_message: string; error_code?: string; page?: string };
}

// ─── Core dispatcher ─────────────────────────────────────────────────────────
function send<E extends keyof EventMap>(event: E, params: EventMap[E]): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const analytics = {
  // Navigation — called automatically by AnalyticsPageTracker
  pageView: (path: string, title?: string) =>
    send("page_view", { page_path: path, page_title: title }),

  // Auth
  signUp:  (method?: string) => send("sign_up",  { method }),
  login:   (method?: string) => send("login",    { method }),
  logout:  ()                => send("logout",   {}),

  // Contests
  contestRegister: (id: string, name?: string) =>
    send("contest_register", { contest_id: id, contest_name: name }),
  contestStart: (id: string) =>
    send("contest_start", { contest_id: id }),
  contestVote: (id: string, candidateId?: string) =>
    send("contest_vote", { contest_id: id, candidate_id: candidateId }),
  contestEnd: (id: string, winner?: string) =>
    send("contest_end", { contest_id: id, winner }),

  // Community
  prayerSubmit:     (category?: string) => send("prayer_submit",     { category }),
  testimonyPublish: (id?: string)       => send("testimony_publish", { testimony_id: id }),

  // Discovery
  search: (term: string) => send("site_search", { search_term: term }),
  languageChange: (lang: "fr" | "ht" | "en" | "es", prev?: string) =>
    send("language_change", { language: lang, previous_language: prev }),

  // Donations
  donateClick:   (amount?: number)               => send("donate_click",          { amount }),
  donateStart:   (amount: number)                => send("donate_paypal_start",   { amount }),
  donateSuccess: (amount: number, id?: string)   => send("donate_paypal_success", { amount, capture_id: id }),
  donateError:   (msg?: string)                  => send("donate_paypal_error",   { error_message: msg }),

  // Content
  download: (name: string, type?: string) => send("file_download", { file_name: name, file_type: type }),

  // Errors
  error: (message: string, code?: string, page?: string) =>
    send("app_error", { error_message: message, error_code: code, page }),
} as const;
