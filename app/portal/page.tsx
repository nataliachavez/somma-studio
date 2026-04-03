"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Clase, Inscripcion } from "@/lib/types";
import { format, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { diasHastaVencimiento, formatFecha, formatMoneda } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function PortalPage() {
  const [user, setUser]               = useState<any>(null);
  const [email, setEmail]             = useState("");
  const [loginSent, setLoginSent]     = useState(false);
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [clases, setClases]           = useState<Clase[]>([]);
  const [reservando, setReservando]   = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Cargar inscripción activa y clases próximas
    Promise.all([
      fetch("/api/portal/mi-inscripcion").then(r => r.json()),
      fetch("/api/portal/clases-proximas").then(r => r.json()),
    ]).then(([ins, cls]) => {
      setInscripcion(ins.inscripcion ?? null);
      setClases(cls.clases ?? []);
    });
  }, [user]);

  const sendMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/portal` } });
    if (!error) setLoginSent(true);
  };

  const reservar = async (claseId: string) => {
    setReservando(claseId);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch("/api/portal/reservar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ clase_id: claseId }),
    });
    // Recargar clases
    fetch("/api/portal/clases-proximas").then(r => r.json()).then(d => setClases(d.clases ?? []));
    setReservando(null);
  };

  const logout = () => supabase.auth.signOut();

  // --- Login screen ---
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF8F5" }}>
      <p style={{ fontSize: "13px", color: "#9A8880" }}>Cargando...</p>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#FAF8F5" }}>
      <div style={{ width: "50%", background: "#C97B5A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem" }}>
        <Image src="/logo.png" alt="Somma Studio" width={200} height={200} style={{ objectFit: "contain" }} />
        <div style={{ width: "40px", height: "0.5px", background: "rgba(255,255,255,0.5)", margin: "2rem 0" }} />
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontWeight: 300, fontSize: "17px", color: "rgba(255,255,255,0.85)", textAlign: "center", maxWidth: "260px", lineHeight: 1.7 }}>
          Tu espacio para gestionar tus clases y plan
        </p>
      </div>
      <div style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem" }}>
        {!loginSent ? (
          <div style={{ width: "100%", maxWidth: "320px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "26px", color: "#2C2420", marginBottom: "4px" }}>Bienvenida</h2>
            <p style={{ fontSize: "12px", color: "#9A8880", marginBottom: "2rem" }}>Ingresa tu email para acceder</p>
            <label className="ss-label">Correo electrónico</label>
            <input className="ss-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={{ marginBottom: "1.5rem" }} />
            <button className="ss-btn" onClick={sendMagicLink}>Ingresar con magic link</button>
            <p style={{ fontSize: "11px", color: "#9A8880", marginTop: "12px", textAlign: "center", lineHeight: 1.6 }}>
              Te enviaremos un link seguro a tu email. No necesitas contraseña.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center", maxWidth: "320px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📬</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "24px", color: "#2C2420", marginBottom: "8px" }}>Revisa tu email</h2>
            <p style={{ fontSize: "13px", color: "#9A8880", lineHeight: 1.7 }}>
              Te enviamos un link de acceso a <strong>{email}</strong>. Haz clic en el link para entrar.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // --- Portal autenticado ---
  const diasRestantes = inscripcion?.fecha_vencimiento ? diasHastaVencimiento(inscripcion.fecha_vencimiento) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Jost',sans-serif", fontWeight: 300 }}>
      {/* Header */}
      <header style={{ background: "#1E1C19", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Image src="/logo.png" alt="Somma Studio" width={70} height={70} style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <p style={{ fontSize: "12px", color: "rgba(245,240,232,0.6)" }}>{user.email}</p>
          <button onClick={logout} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", border: "0.5px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(245,240,232,0.6)", padding: "5px 12px", borderRadius: "4px", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>
            Salir
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "26px", color: "#2C2420", marginBottom: "1.5rem" }}>
          Mi <span style={{ fontStyle: "italic", color: "#C97B5A" }}>portal</span>
        </h1>

        {/* Mi plan */}
        <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "12px" }}>Mi plan activo</p>
          {!inscripcion ? (
            <p style={{ fontSize: "13px", color: "#9A8880" }}>No tienes un plan activo. Contáctanos para inscribirte.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "10px", color: "#9A8880", marginBottom: "4px" }}>Plan</p>
                <p style={{ fontSize: "15px", fontWeight: 400, color: "#2C2420" }}>{inscripcion.planes?.nombre}</p>
              </div>
              <div>
                <p style={{ fontSize: "10px", color: "#9A8880", marginBottom: "4px" }}>Vence</p>
                <p style={{ fontSize: "15px", fontWeight: 400, color: diasRestantes !== null && diasRestantes <= 7 ? "#C97B5A" : "#2C2420" }}>
                  {inscripcion.fecha_vencimiento ? formatFecha(inscripcion.fecha_vencimiento) : "Sin vencimiento"}
                </p>
                {diasRestantes !== null && <p style={{ fontSize: "11px", color: "#9A8880" }}>en {diasRestantes} días</p>}
              </div>
              <div>
                <p style={{ fontSize: "10px", color: "#9A8880", marginBottom: "4px" }}>Clases restantes</p>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "28px", fontWeight: 300, color: "#2C2420", lineHeight: 1 }}>
                  {inscripcion.clases_restantes ?? "∞"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "10px", color: "#9A8880", marginBottom: "4px" }}>Clases usadas</p>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "28px", fontWeight: 300, color: "#2C2420", lineHeight: 1 }}>
                  {inscripcion.clases_usadas}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Clases próximas */}
        <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1.25rem" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "12px" }}>
            Clases disponibles — próximos 7 días
          </p>
          {clases.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#9A8880" }}>No hay clases programadas para los próximos días.</p>
          ) : (
            clases.map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "0.5px solid #F5F3EF" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ width: "4px", height: "40px", borderRadius: "2px", background: c.tipos_clase?.color ?? "#C97B5A", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 400, color: "#2C2420" }}>{c.tipos_clase?.nombre}</p>
                    <p style={{ fontSize: "11px", color: "#9A8880" }}>
                      {format(parseISO(c.fecha), "EEEE d MMM", { locale: es })} · {c.hora_inicio} – {c.hora_fin}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9A8880" }}>
                      {c.coaches?.nombre} {c.coaches?.apellido}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <p style={{ fontSize: "11px", color: c.cupo_disponible === 0 ? "#C97B5A" : "#6A9A48" }}>
                    {c.cupo_disponible === 0 ? "Sin cupos" : `${c.cupo_disponible} cupos disponibles`}
                  </p>
                  <button
                    onClick={() => reservar(c.id)}
                    disabled={c.cupo_disponible === 0 || reservando === c.id}
                    style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 16px", border: "none", borderRadius: "4px", cursor: c.cupo_disponible === 0 ? "not-allowed" : "pointer", background: c.cupo_disponible === 0 ? "#E8E0D8" : "#2C2420", color: c.cupo_disponible === 0 ? "#9A8880" : "#FAF8F5", fontFamily: "'Jost',sans-serif", transition: "background 0.2s" }}
                  >
                    {reservando === c.id ? "Reservando..." : c.cupo_disponible === 0 ? "Lista de espera" : "Reservar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
