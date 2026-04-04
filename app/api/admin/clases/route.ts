import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("clases")
    .select("*, tipos_clase(*), coaches(*)")
    .order("fecha").order("hora_inicio");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clases: data ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const db   = supabaseAdmin();
    const body = await req.json();

    if (!body.tipo_clase_id || !body.coach_id || !body.fecha || !body.hora_inicio) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const hora_fin = body.hora_fin || calcularHoraFin(body.hora_inicio, body.duracion ?? "60");

    const { data, error } = await db.from("clases").insert([{
      tipo_clase_id:   body.tipo_clase_id,
      coach_id:        body.coach_id,
      fecha:           body.fecha,
      hora_inicio:     body.hora_inicio,
      hora_fin:        hora_fin,
      cupo_maximo:     parseInt(body.cupo_maximo ?? "10"),
      cupo_disponible: parseInt(body.cupo_maximo ?? "10"),
      etiqueta:        body.etiqueta || null,
      es_recurrente:   body.es_recurrente ?? false,
      estado:          "programada",
    }]).select().single();

    if (error) {
      console.error("Error insertando clase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ clase: data }, { status: 201 });
  } catch (err) {
    console.error("Error inesperado:", err);
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}

function calcularHoraFin(inicio: string, minutos: string): string {
  const [h, m] = inicio.split(":").map(Number);
  const total  = h * 60 + m + parseInt(minutos);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
