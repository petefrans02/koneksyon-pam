import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// GET — vérification PUBLIQUE d'un certificat par son code.
// C'est ce qui distingue une attestation sérieuse d'un simple PDF : n'importe
// qui (un employeur, une église) peut contrôler l'authenticité en ligne.
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { data } = await db
    .from("certificates")
    .select("code, holder_name, program, level, lessons_done, xp, issued_at")
    .eq("code", code.toUpperCase().trim())
    .maybeSingle();

  if (!data) return NextResponse.json({ valid: false });
  return NextResponse.json({ valid: true, certificate: data });
}
