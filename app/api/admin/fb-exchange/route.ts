// GET /api/admin/fb-exchange?token=SHORT_LIVED_USER_TOKEN
// Exchanges a short-lived user token → long-lived token → permanent page tokens
// Then auto-updates Vercel env vars via the Vercel API
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const PAGE_IDS = [
  { env: "FACEBOOK_PAGE_1", id: process.env.FACEBOOK_PAGE_1_ID ?? "" },
  { env: "FACEBOOK_PAGE_2", id: process.env.FACEBOOK_PAGE_2_ID ?? "" },
  { env: "FACEBOOK_PAGE_3", id: process.env.FACEBOOK_PAGE_3_ID ?? "" },
];

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const shortToken = request.nextUrl.searchParams.get("token");
  if (!shortToken) return NextResponse.json({ error: "Paramètre ?token= requis" }, { status: 400 });

  const appId     = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) return NextResponse.json({ error: "FACEBOOK_APP_ID ou FACEBOOK_APP_SECRET manquant" }, { status: 500 });

  // Step 1: Exchange short-lived user token → long-lived user token (60 days)
  const exchangeRes = await fetch(
    `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
  );
  const exchangeData = await exchangeRes.json();
  if (exchangeData.error) {
    return NextResponse.json({ error: "Échange échoué", detail: exchangeData.error.message }, { status: 400 });
  }
  const longLivedToken: string = exchangeData.access_token;

  // Step 2: Get permanent Page Access Tokens via /me/accounts
  const accountsRes = await fetch(
    `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token&access_token=${longLivedToken}`
  );
  const accountsData = await accountsRes.json();

  const pageTokens: { env: string; id: string; name?: string; token?: string; error?: string }[] = [];

  if (accountsData.error) {
    // /me/accounts failed — fall back to storing the long-lived user token itself for posting
    for (const page of PAGE_IDS) {
      pageTokens.push({ ...page, error: `me/accounts échoué: ${accountsData.error.message}. Token utilisateur long-lived utilisé.`, token: longLivedToken });
    }
  } else {
    const fbPages: Array<{ id: string; name: string; access_token: string }> = accountsData.data ?? [];
    for (const page of PAGE_IDS) {
      if (!page.id) { pageTokens.push({ ...page, error: "ID non configuré" }); continue; }
      const match = fbPages.find(p => p.id === page.id);
      if (match) {
        pageTokens.push({ ...page, name: match.name, token: match.access_token });
      } else {
        // Page not found via /me/accounts — use long-lived user token as fallback
        pageTokens.push({ ...page, error: `Page ${page.id} non trouvée dans me/accounts — token utilisateur utilisé`, token: longLivedToken });
      }
    }
  }

  // Step 3: Auto-update Vercel env vars via Vercel API
  const vercelToken = process.env.VERCEL_ACCESS_TOKEN;
  const projectId   = process.env.VERCEL_PROJECT_ID ?? "prj_XQyXvUysT8x7IRQjeagyY3x6RZwZ";
  let vercelUpdated = false;

  if (vercelToken) {
    // List all env vars once
    const listRes  = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env?target=production&limit=100`, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });
    const listData = await listRes.json();
    const envList: Array<{ id: string; key: string }> = listData.envs ?? [];

    for (const p of pageTokens) {
      if (!p.token) continue;
      const envKey  = `${p.env}_TOKEN`;
      const existing = envList.find(e => e.key === envKey);
      if (existing) {
        await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ value: p.token, target: ["production"], type: "sensitive" }),
        });
        vercelUpdated = true;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    long_lived_token_expires: "60 jours",
    page_tokens: pageTokens.map(p => ({
      page: p.name ?? p.id,
      env_var: `${p.env}_TOKEN`,
      success: !!p.token,
      error: p.error,
      token_preview: p.token ? `${p.token.slice(0, 20)}...` : null,
    })),
    vercel_auto_updated: vercelUpdated,
    instruction: vercelUpdated
      ? "✅ Tokens mis à jour automatiquement dans Vercel !"
      : "⚠️ Copie les tokens manuellement (VERCEL_ACCESS_TOKEN non configuré)",
  });
}
