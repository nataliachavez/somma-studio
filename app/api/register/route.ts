import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = supabaseAdmin();
    const { data, error } = await db.from("alumnas").insert([body]).select().single();
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "Este correo ya está registrado." }, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL ?? "hola@sommastudio.com",
        to: body.email,
        subject: `¡Bienvenida a Somma Studio, ${body.nombre}!`,
        html: `<div style="font-family:sans-serif;max-width:500px;margin:auto">
          <div style="background:#C97B5A;padding:32px;text-align:center">
            <p style="color:#fff;font-size:24px;margin:0;font-weight:300;letter-spacing:2px">somma studio</p>
          </div>
          <div style="padding:32px;background:#fff">
            <p style="font-size:18px;color:#2C2420">Hola, <strong>${body.nombre}</strong> 🌸</p>
            <p style="color:#6A5E58;line-height:1.7">Estamos muy felices de tenerte con nosotras. Tu registro fue recibido con éxito.</p>
            <p style="color:#6A5E58;line-height:1.7">Pronto nos pondremos en contacto contigo para darte la bienvenida oficial.</p>
            <p style="color:#9A8880;font-style:italic;margin-top:24px">Con cariño,<br/>El equipo de Somma Studio</p>
          </div>
        </div>`,
      });
    } catch (e) { console.error("Email error:", e); }
    return NextResponse.json({ success: true, alumna: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Error inesperado" }, { status: 500 }); }
}
