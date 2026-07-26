// Envoi de notifications Web Push (serveur uniquement).
//
// Les abonnements vivent dans `push_subscriptions` (un utilisateur peut en avoir
// plusieurs : téléphone, ordinateur, navigateurs différents). Un endpoint que le
// service de push rejette définitivement (404/410) est supprimé automatiquement.

import webpush from "web-push";
import { adminDb } from "@/lib/admin-auth";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}

export function isPushConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:contact@koneksyonpam.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

interface SubRow { id: string; user_id: string; endpoint: string; p256dh: string; auth: string }

export interface PushResult {
  sent: number;
  failed: number;
  removed: number;      // abonnements périmés supprimés
  devices: number;      // appareils ciblés
  error: string | null;
}

// Envoie une notification à une liste d'utilisateurs (tous leurs appareils).
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<PushResult> {
  const empty: PushResult = { sent: 0, failed: 0, removed: 0, devices: 0, error: null };
  if (userIds.length === 0) return empty;
  if (!isPushConfigured()) {
    return { ...empty, error: "Clés VAPID absentes — aucune notification push n'est partie." };
  }
  configure();

  const db = adminDb();
  const { data, error } = await db
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  if (error) {
    // Table absente = migration SQL pas encore exécutée : on le dit clairement.
    return { ...empty, error: `Lecture des abonnements push impossible : ${error.message}` };
  }

  const subs = (data ?? []) as SubRow[];
  if (subs.length === 0) return { ...empty, error: null };

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/",
    icon: payload.icon ?? "/icon.png",
    tag: payload.tag,
  });

  let sent = 0, failed = 0;
  const stale: string[] = [];
  let firstError: string | null = null;

  // Par lots de 10 : les services de push n'aiment pas les rafales.
  for (let i = 0; i < subs.length; i += 10) {
    const batch = subs.slice(i, i + 10);
    const results = await Promise.allSettled(batch.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        body,
      )
    ));

    results.forEach((r, idx) => {
      if (r.status === "fulfilled") { sent++; return; }
      failed++;
      const status = (r.reason as { statusCode?: number })?.statusCode;
      // 404/410 = l'abonnement n'existe plus côté navigateur → on le purge.
      if (status === 404 || status === 410) stale.push(batch[idx].id);
      else if (!firstError) firstError = String(r.reason).slice(0, 200);
    });
  }

  let removed = 0;
  if (stale.length) {
    const { error: delErr } = await db.from("push_subscriptions").delete().in("id", stale);
    if (!delErr) removed = stale.length;
  }

  return { sent, failed, removed, devices: subs.length, error: firstError };
}
