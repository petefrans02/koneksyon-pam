import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) return Response.json({ error: "File too large. Max 5MB." }, { status: 400 });

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) return Response.json({ error: "Only images allowed (JPG, PNG, GIF, WebP)" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await getSupabase().storage
    .from("uploads")
    .upload(fileName, buffer, { contentType: file.type });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = getSupabase().storage.from("uploads").getPublicUrl(fileName);

  return Response.json({ url: data.publicUrl });
}
