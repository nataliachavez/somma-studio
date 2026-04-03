import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { format, addDays } from "date-fns";

export async function GET() {
  const db  = supabaseAdmin();
  const hoy = format(new Date(), "yyyy-MM-dd");
  const en7 = format(addDays(new Date(), 7), "yyyy-MM-dd");
  const { data, error } = await db
    .from("clases")
    .select("*, tipos_clase(*), coaches(*)")
    .gte("fecha", hoy)
    .lte("fecha", en7)
    .eq("estado", "programada")
    .order("fecha").order("hora_inicio");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clases: data });
}
