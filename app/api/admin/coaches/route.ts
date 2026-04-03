import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db.from("coaches").select("*").order("nombre");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coaches: data });
}

export async function POST(req: NextRequest) {
  const db   = supabaseAdmin();
  const body = await req.json();
  const { data, error } = await db.from("coaches").insert([{
    nombre:       body.nombre,
    apellido:     body.apellido,
    email:        body.email,
    telefono:     body.telefono || null,
    especialidad: body.especialidad ?? [],
    bio:          body.bio || null,
    foto_url:     body.foto_url || null,
    activa:       true,
  }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coach: data }, { status: 201 });
}
