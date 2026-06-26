import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

// GET — all churches the current user belongs to (member OR owner)
export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ groups: [] });

  const db = getDb();

  // Groups where user is a member (via church_memberships)
  const { data: memberships } = await db
    .from("church_memberships")
    .select("church_id, department_id")
    .eq("user_id", user.id);

  // Groups where user is owner
  const { data: owned } = await db
    .from("churches")
    .select("id, name, description, join_code, logo_url, owner_user_id")
    .eq("owner_user_id", user.id);

  const memberIds = (memberships || []).map((m) => m.church_id);
  const ownedIds = new Set((owned || []).map((c) => c.id));

  // Fetch church details for member groups (excluding ones user owns)
  let memberChurches: { id: string; name: string; description: string; join_code: string; logo_url: string; owner_user_id: string }[] = [];
  const nonOwnedIds = memberIds.filter((id) => !ownedIds.has(id));
  if (nonOwnedIds.length > 0) {
    const { data } = await db
      .from("churches")
      .select("id, name, description, join_code, logo_url, owner_user_id")
      .in("id", nonOwnedIds);
    memberChurches = data || [];
  }

  // Fetch department names from church_subgroups
  const deptIds = (memberships || []).map((m) => m.department_id).filter(Boolean) as string[];
  let deptMap: Record<string, { name: string; icon: string }> = {};
  if (deptIds.length > 0) {
    const { data: subs } = await db
      .from("church_subgroups")
      .select("id, name, icon")
      .in("id", deptIds);
    for (const s of subs || []) {
      deptMap[s.id] = { name: s.name, icon: s.icon || "📋" };
    }
  }

  const ownedGroups = (owned || []).map((c) => ({
    ...c,
    role: "owner" as const,
    department: null,
  }));

  const memberGroups = memberChurches.map((c) => {
    const m = (memberships || []).find((m) => m.church_id === c.id);
    return {
      ...c,
      role: "member" as const,
      department: m?.department_id ? (deptMap[m.department_id] || null) : null,
    };
  });

  return Response.json({ groups: [...ownedGroups, ...memberGroups] });
}
