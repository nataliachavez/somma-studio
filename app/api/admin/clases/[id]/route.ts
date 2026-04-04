import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = supabaseAdmin();
  const [claseRes, reservasRes] = await Promise.all([
    db.from("clases")
      .select("*, tipos_clase(*), coaches(*)")
      .eq("id", params.id)
      .single(),
    db.from("reservas")
      .select("*, alumnas(nombre, apellido, email, telefono, clase_interes)")
      .eq("clase_id", params.id)
      .order("created_at"),
  ]);
  if (claseRes.error) return NextResponse.json({ error: claseRes.error.message }, { status: 500 });
  return NextResponse.json({ clase: claseRes.data, reservas: reservasRes.data ?? [] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db   = supabaseAdmin();
  const body = await req.json();
  const { error } = await db.from("reservas")
    .update({ estado: body.estado })
    .eq("id", body.reserva_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
