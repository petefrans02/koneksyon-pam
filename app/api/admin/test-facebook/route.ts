// GET /api/admin/test-facebook — tests each Facebook page token and returns status
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const results = [];
  for (let i = 1; i <= 3; i++) {
    const id    = process.env[`FACEBOOK_PAGE_${i}_ID`];
    const token = process.env[`FACEBOOK_PAGE_${i}_TOKEN`];
    if (!id || !token) continue;

    try {
      // Check token validity and page info
      const r = await fetch(
        `https://graph.facebook.com/v20.0/${id}?fields=name,fan_count,access_token&access_token=${token}`
      );
      const d = await r.json();

      // Check token expiry
      const debugR = await fetch(
        `https://graph.facebook.com/v20.0/debug_token?input_token=${token}&access_token=${token}`
      );
      const debugD = await debugR.json();
      const expiry = debugD.data?.expires_at;
      const isExpired = expiry ? expiry < Math.floor(Date.now() / 1000) : false;
      const expiryDate = expiry ? new Date(expiry * 1000).toISOString() : "never (permanent)";

      results.push({
        page: i,
        id,
        name: d.name ?? "UNKNOWN",
        fan_count: d.fan_count ?? 0,
        token_valid: !!d.name && !d.error,
        token_expired: isExpired,
        token_expires: expiryDate,
        error: d.error?.message ?? null,
      });
    } catch (e) {
      results.push({ page: i, id, token_valid: false, error: String(e) });
    }
  }

  const allValid = results.every(r => r.token_valid && !r.token_expired);
  return NextResponse.json({ ok: allValid, pages: results });
}
