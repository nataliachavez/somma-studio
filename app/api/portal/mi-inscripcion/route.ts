import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = supabaseAdmin();
  const { data: alumna } = await db.from("alumnas").select("id").eq("auth_user_id", user.id).single();
  if (!alumna) return NextResponse.json({ inscripcion: null });
  const { data } = await db.from("inscripciones").select("*, planes(*)").eq("alumna_id", alumna.id).eq("estado", "activa").order("created_at", { ascending: false }).limit(1).single();
  return NextResponse.json({ inscripcion: data });
}
