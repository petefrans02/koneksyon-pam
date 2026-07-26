// POST /api/admin/test-post — test Facebook posting directly, returns full API response
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const results = [];

  for (let i = 1; i <= 3; i++) {
    const pageId    = process.env[`FACEBOOK_PAGE_${i}_ID`];
    const pageToken = process.env[`FACEBOOK_PAGE_${i}_TOKEN`];
    if (!pageId || !pageToken) {
      results.push({ page: i, skipped: true, reason: "ID ou TOKEN manquant" });
      continue;
    }

    // Test 1: vérifier que le token est valide
    const meRes  = await fetch(`https://graph.facebook.com/v20.0/${pageId}?fields=name,id&access_token=${pageToken}`);
    const meData = await meRes.json();

    // Test 2: essayer de poster un message test
    const postBody = {
      message: `🔔 Test automatique KONEKSYON PAM — ${new Date().toLocaleString("fr-FR", { timeZone: "America/New_York" })} (Miami)`,
      access_token: pageToken,
    };
    const postRes  = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postBody),
    });
    const postData = await postRes.json();

    results.push({
      page: i,
      page_id: pageId,
      token_check: { ok: !!meData.name, name: meData.name, error: meData.error?.message },
      post_result: { ok: !!postData.id, post_id: postData.id, error: postData.error?.message, error_code: postData.error?.code, error_subcode: postData.error?.error_subcode },
    });
  }

  return NextResponse.json({ results, timestamp: new Date().toISOString() });
}
