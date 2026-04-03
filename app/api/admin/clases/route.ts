import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("clases")
    .select("*, tipos_clase(*), coaches(*)")
    .order("fecha").order("hora_inicio");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clases: data });
}

export async function POST(req: NextRequest) {
  const db   = supabaseAdmin();
  const body = await req.json();
  const { data, error } = await db.from("clases").insert([{
    tipo_clase_id:   body.tipo_clase_id,
    coach_id:        body.coach_id,
    fecha:           body.fecha,
    hora_inicio:     body.hora_inicio,
    hora_fin:        body.hora_fin,
    cupo_maximo:     parseInt(body.cupo_maximo),
    cupo_disponible: parseInt(body.cupo_maximo),
    etiqueta:        body.etiqueta || null,
    es_recurrente:   body.es_recurrente ?? false,
    estado:          "programada",
  }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clase: data }, { status: 201 });
}
