import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { nombre, email } = await req.json();
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "hola@sommastudio.com",
      to: email,
      subject: `¡Feliz cumpleaños, ${nombre}! 🎂`,
      html: `<div style="font-family:sans-serif;max-width:500px;margin:auto">
        <div style="background:#C97B5A;padding:32px;text-align:center">
          <p style="font-size:48px;margin:0">🎂</p>
          <p style="color:#fff;font-size:22px;margin:8px 0 0;font-weight:300">¡Feliz cumpleaños!</p>
        </div>
        <div style="padding:32px;background:#fff">
          <p style="font-size:18px;color:#2C2420">Querida <strong>${nombre}</strong>,</p>
          <p style="color:#6A5E58;line-height:1.7">En este día especial, todo el equipo de <strong>Somma Studio</strong> te desea un cumpleaños lleno de alegría y movimiento. 🌸</p>
          <p style="color:#9A8880;font-style:italic">Con cariño,<br/>El equipo de Somma Studio</p>
        </div>
      </div>`,
    });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "No se pudo enviar" }, { status: 500 }); }
}
