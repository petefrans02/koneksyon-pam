// GET /api/admin/fb-oauth/callback — Facebook OAuth callback
// Exchanges code → long-lived token → page tokens → stores in Supabase
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(request: NextRequest) {
  const code  = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/admin/social?fb_error=${encodeURIComponent(error ?? "no_code")}`, request.url));
  }

  const appId       = process.env.FACEBOOK_APP_ID!;
  const appSecret   = process.env.FACEBOOK_APP_SECRET!;
  const redirectUri = "https://koneksyonpam.com/api/admin/fb-oauth/callback";

  // Step 1: Exchange code → short-lived user token
  const tokenRes  = await fetch(
    `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
  );
  const tokenData = await tokenRes.json();
  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(new URL(`/admin/social?fb_error=${encodeURIComponent(tokenData.error?.message ?? "token_exchange_failed")}`, request.url));
  }
  const shortToken: string = tokenData.access_token;

  // Step 2: Exchange short-lived → long-lived user token (60 days)
  const longRes  = await fetch(
    `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
  );
  const longData = await longRes.json();
  const longToken: string = longData.access_token ?? shortToken;

  // Step 3: Get Page Access Tokens (permanent) via /me/accounts
  const accountsRes  = await fetch(
    `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token,fan_count&access_token=${longToken}`
  );
  const accountsData = await accountsRes.json();
  const pages: Array<{ id: string; name: string; access_token: string; fan_count?: number }> = accountsData.data ?? [];

  const db = adminDb();

  if (pages.length === 0) {
    // Fallback: store the long-lived user token for each configured page ID
    const pageIds = [
      { id: process.env.FACEBOOK_PAGE_1_ID, name: "Pasteur Peterson Francis" },
      { id: process.env.FACEBOOK_PAGE_2_ID, name: "Pasteur P.Francis" },
      { id: process.env.FACEBOOK_PAGE_3_ID, name: "Koneksyon Pam" },
    ].filter(p => p.id);

    for (const p of pageIds) {
      await db.from("facebook_page_tokens").upsert({
        page_id: p.id,
        page_name: p.name,
        access_token: longToken,
        token_type: "user_longterm",
        expires_at: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "page_id" });
    }
  } else {
    for (const page of pages) {
      await db.from("facebook_page_tokens").upsert({
        page_id: page.id,
        page_name: page.name,
        fan_count: page.fan_count ?? 0,
        access_token: page.access_token,
        token_type: "page_permanent",
        expires_at: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "page_id" });
    }
  }

  return NextResponse.redirect(new URL("/admin/social?fb_connected=1", request.url));
}
