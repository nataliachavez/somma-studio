"use client";
import { useEffect, useState } from "react";
import { Clase, Inscripcion } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { diasHastaVencimiento, formatFecha } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function PortalPage() {
  const [user, setUser]               = useState<any>(null);
  const [email, setEmail]             = useState("");
  const [loginSent, setLoginSent]     = useState(false);
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [clases, setClases]           = useState<Clase[]>([]);
  const [reservando, setReservando]   = useState<string | null>(null);
  const [reservadas, setReservadas]   = useState<string[]>([]);
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const token = session?.access_token;
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const [ins, cls] = await Promise.all([
        fetch("/api/portal/mi-inscripcion", { headers }).then(r => r.json()),
        fetch("/api/portal/clases-proximas").then(r => r.json()),
      ]);
      setInscripcion(ins.inscripcion ?? null);
      setClases(cls.clases ?? []);
    });
  }, [user]);

  const sendMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal` },
    });
    if (!error) setLoginSent(true);
  };

  const reservar = async (claseId: string) => {
    setReservando(claseId);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/portal/reservar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ clase_id: claseId }),
    });
    if (res.ok) {
      setReservadas(prev => [...prev, claseId]);
      setClases(prev => prev.map(c => c.id === claseId ? { ...c, cupo_disponible: c.cupo_disponible - 1 } : c));
    }
    setReservando(null);
  };

  const logout = () => supabase.auth.signOut();

  const panelIzquierdo = (
    <div style={{ backgroundColor: "#C97B5A", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "4rem 3rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "280px", height: "280px", borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", bottom: "60px", left: "-50px", width: "180px", height: "180px", borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.1)" }} />
      <div style={{ position: "absolute", top: "30%", right: "-30px", width: "100px", height: "100px", borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.08)" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "30px", height: "0.5px", background: "rgba(255,255,255,0.5)", marginBottom: "2rem" }} />
        <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontWeight: 400, fontSize: "72px", letterSpacing: "0.06em", color: "#FFFFFF", lineHeight: 1, margin: "0 0 2px 0" }}>
          somma
        </h1>
        <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: "13px", letterSpacing: "0.55em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", margin: "0 0 2.5rem 0" }}>
          studio
        </p>
        <div style={{ width: "40px", height: "0.5px", background: "rgba(255,255,255,0.4)", marginBottom: "2.5rem" }} />
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "3rem" }}>
          {["Barre", "Pilates", "Yoga"].map((tag, i) => (
            <span key={tag} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>{tag}</span>
              {i < 2 && <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "inline-block" }} />}
            </span>
          ))}
        </div>
        <p style={{ fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
          Trujillo, Perú
        </p>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF8F5" }}>
      <p style={{ fontSize: "13px", color: "#9A8880", fontFamily: "'Jost',sans-serif" }}>Cargando...</p>
    </div>
  );

  if (!user) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;1,400&family=Jost:wght@300;400&display=swap" rel="stylesheet" />
      <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {panelIzquierdo}
        <div style={{ background: "#FAF8F5", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem 3.5rem" }}>
          {!loginSent ? (
            <div style={{ maxWidth: "340px" }}>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 400, fontSize: "26px", color: "#2C2420", marginBottom: "4px" }}>
                Bienvenido/a
              </h2>
              <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "12px", letterSpacing: "0.05em", color: "#9A8880", marginBottom: "2rem" }}>
                Ingresa tu email para acceder a tu portal
              </p>
              <label className="ss-label">Correo electrónico</label>
              <input
                className="ss-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{ marginBottom: "1.5rem" }}
                onKeyDown={e => e.key === "Enter" && sendMagicLink()}
              />
              <button className="ss-btn" onClick={sendMagicLink}>
                Ingresar
              </button>
              <p style={{ fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: "11px", color: "#9A8880", marginTop: "16px", lineHeight: 1.7, textAlign: "center" }}>
                Te enviaremos un link seguro a tu correo.<br />No necesitas contraseña.
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: "340px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: "48px", color: "#C97B5A", marginBottom: "16px" }}>✦</div>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 400, fontSize: "24px", color: "#2C2420", marginBottom: "12px" }}>
                Revisa tu correo
              </h2>
              <p style={{ fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: "13px", color: "#9A8880", lineHeight: 1.7 }}>
                Enviamos un link de acceso a<br /><strong style={{ color: "#2C2420", fontWeight: 400 }}>{email}</strong><br />Haz clic en el link para entrar.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );

  const diasRestantes = inscripcion?.fecha_vencimiento ? diasHastaVencimiento(inscripcion.fecha_vencimiento) : null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;1,400&family=Jost:wght@300;400&display=swap" rel="stylesheet" />
      <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
        <header style={{ background: "#C97B5A", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontFamily: "'Libre Baskerville',serif", fontSize: "22px", color: "#FFFFFF", letterSpacing: "0.05em" }}>somma</span>
            <span style={{ fontFamily: "'Jost',sans-serif", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>studio</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>{user.email}</p>
            <button onClick={logout} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", border: "0.5px solid rgba(255,255,255,0.4)", background: "transparent", color: "rgba(255,255,255,0.75)", padding: "5px 12px", borderRadius: "4px", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>
              Salir
            </button>
          </div>
        </header>

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem" }}>
          <h1 style={{ fontFamily: "'Libre Baskerville',serif", fontWeight: 400, fontSize: "24px", color: "#2C2420", marginBottom: "1.5rem" }}>
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
                  <p style={{ fontSize: "10px", color: "#9A8880", marginBottom: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Plan</p>
                  <p style={{ fontSize: "15px", fontWeight: 400, color: "#2C2420" }}>{inscripcion.planes?.nombre}</p>
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "#9A8880", marginBottom: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Vence</p>
                  <p style={{ fontSize: "15px", fontWeight: 400, color: diasRestantes !== null && diasRestantes <= 7 ? "#C97B5A" : "#2C2420" }}>
                    {inscripcion.fecha_vencimiento ? formatFecha(inscripcion.fecha_vencimiento) : "Sin vencimiento"}
                  </p>
                  {diasRestantes !== null && <p style={{ fontSize: "11px", color: "#9A8880", marginTop: "2px" }}>en {diasRestantes} días</p>}
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "#9A8880", marginBottom: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Clases restantes</p>
                  <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: "28px", fontWeight: 400, color: "#2C2420", lineHeight: 1 }}>
                    {inscripcion.clases_restantes ?? "∞"}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "#9A8880", marginBottom: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Clases tomadas</p>
                  <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: "28px", fontWeight: 400, color: "#2C2420", lineHeight: 1 }}>
                    {inscripcion.clases_usadas}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Clases disponibles */}
          <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1.25rem" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "12px" }}>
              Clases disponibles · próximos 7 días
            </p>
            {clases.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9A8880" }}>No hay clases programadas para los próximos días.</p>
            ) : (
              clases.map(c => {
                const yaReservada = reservadas.includes(c.id);
                const sinCupo    = c.cupo_disponible <= 0;
                return (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "0.5px solid #F5F3EF" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <div style={{ width: "4px", height: "44px", borderRadius: "2px", background: c.tipos_clase?.color ?? "#C97B5A", flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 400, color: "#2C2420", marginBottom: "2px" }}>{c.tipos_clase?.nombre}</p>
                        <p style={{ fontSize: "11px", color: "#9A8880" }}>
                          {format(parseISO(c.fecha), "EEEE d 'de' MMMM", { locale: es })} · {c.hora_inicio?.slice(0,5)} – {c.hora_fin?.slice(0,5)}
                        </p>
                        <p style={{ fontSize: "11px", color: "#9A8880" }}>
                          {c.coaches?.nombre} {c.coaches?.apellido}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <p style={{ fontSize: "11px", color: sinCupo ? "#C97B5A" : "#6A9A48" }}>
                        {sinCupo ? "Sin cupos" : `${c.cupo_disponible} cupo${c.cupo_disponible !== 1 ? "s" : ""}`}
                      </p>
                      <button
                        onClick={() => !yaReservada && !sinCupo && reservar(c.id)}
                        disabled={sinCupo || reservando === c.id || yaReservada}
                        style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 16px", border: "none", borderRadius: "4px", cursor: sinCupo || yaReservada ? "default" : "pointer", background: yaReservada ? "#EAF3DE" : sinCupo ? "#E8E0D8" : "#2C2420", color: yaReservada ? "#3B6D11" : sinCupo ? "#9A8880" : "#FAF8F5", fontFamily: "'Jost',sans-serif", transition: "background 0.2s" }}
                      >
                        {reservando === c.id ? "Reservando..." : yaReservada ? "✓ Reservada" : sinCupo ? "Sin cupos" : "Reservar"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </>
  );
}
