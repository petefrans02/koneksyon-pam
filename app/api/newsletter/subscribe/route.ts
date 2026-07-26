import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, first_name, last_name, lang } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email: email.toLowerCase().trim(), first_name, last_name, lang, subscribed_at: new Date().toISOString() },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Newsletter subscribe error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
