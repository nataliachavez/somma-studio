import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { clase_id } = await req.json();
  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = supabaseAdmin();
  const { data: alumna } = await db.from("alumnas").select("id").eq("auth_user_id", user.id).single();
  if (!alumna) return NextResponse.json({ error: "Alumna no encontrada" }, { status: 404 });
  // Verificar cupo
  const { data: clase } = await db.from("clases").select("cupo_disponible").eq("id", clase_id).single();
  if (!clase || clase.cupo_disponible <= 0) return NextResponse.json({ error: "Sin cupos disponibles" }, { status: 400 });
  // Obtener inscripción activa
  const { data: inscripcion } = await db.from("inscripciones").select("id").eq("alumna_id", alumna.id).eq("estado", "activa").limit(1).single();
  const { error } = await db.from("reservas").insert([{ alumna_id: alumna.id, clase_id, inscripcion_id: inscripcion?.id ?? null, estado: "confirmada" }]);
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Ya estás inscrita en esta clase" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
