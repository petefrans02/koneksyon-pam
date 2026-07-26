// GET /api/admin/fb-oauth/start — redirects admin to Facebook OAuth
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.redirect(new URL("/admin/social?error=unauthorized", request.url));
  }

  const appId       = process.env.FACEBOOK_APP_ID!;
  const redirectUri = "https://koneksyonpam.com/api/admin/fb-oauth/callback";
  const scopes      = "pages_manage_posts,pages_show_list,pages_read_engagement,pages_manage_metadata";

  const fbAuthUrl = `https://www.facebook.com/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=kpf-admin`;

  return NextResponse.redirect(fbAuthUrl);
}
