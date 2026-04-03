"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  nombre: string; apellido: string; email: string; telefono: string;
  fecha_nacimiento: string; clase_interes: string;
  como_nos_conocio: string; observaciones_medicas: string;
};

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const nombre = watch("nombre", "");

  const onSubmit = async (data: FormData) => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Error al registrarse. Intenta nuevamente."); }
      else { setSubmitted(true); }
    } catch { setError("Sin conexión. Intenta nuevamente."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400&display=swap" rel="stylesheet" />

      <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>

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

        <div style={{ background: "#FAF8F5", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem 3.5rem", overflowY: "auto" }}>
          {!submitted ? (
            <>
              <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontWeight: 400, fontSize: "26px", color: "#2C2420", marginBottom: "4px" }}>
                Únete a nosotros
              </h2>
              <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "12px", letterSpacing: "0.05em", color: "#9A8880", marginBottom: "2rem" }}>
                Completa tu registro para comenzar
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label className="ss-label">Nombre *</label>
                    <input className="ss-input" placeholder="Tu nombre" {...register("nombre", { required: true })} />
                    {errors.nombre && <p style={{ color: "#C97B5A", fontSize: "11px", marginTop: "4px" }}>Obligatorio</p>}
                  </div>
                  <div>
                    <label className="ss-label">Apellido *</label>
                    <input className="ss-input" placeholder="Tu apellido" {...register("apellido", { required: true })} />
                    {errors.apellido && <p style={{ color: "#C97B5A", fontSize: "11px", marginTop: "4px" }}>Obligatorio</p>}
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label className="ss-label">Correo electrónico *</label>
                  <input className="ss-input" type="email" placeholder="correo@ejemplo.com" {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })} />
                  {errors.email && <p style={{ color: "#C97B5A", fontSize: "11px", marginTop: "4px" }}>Email inválido</p>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label className="ss-label">Teléfono / WhatsApp *</label>
                    <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
                      <select className="ss-input" style={{ width: "84px", cursor: "pointer", flexShrink: 0 }}>
                        <option>🇵🇪 +51</option>
                        <option>🇺🇸 +1</option>
                        <option>🇦🇷 +54</option>
                        <option>🇨🇱 +56</option>
                        <option>🇨🇴 +57</option>
                        <option>🇻🇪 +58</option>
                        <option>🇲🇽 +52</option>
                        <option>🇧🇷 +55</option>
                        <option>🇪🇨 +593</option>
                        <option>🇪🇸 +34</option>
                        <option>🇬🇧 +44</option>
                        <option>🇫🇷 +33</option>
                      </select>
                      <input className="ss-input" type="tel" placeholder="999 000 000" {...register("telefono", { required: true })} />
                    </div>
                    {errors.telefono && <p style={{ color: "#C97B5A", fontSize: "11px", marginTop: "4px" }}>Obligatorio</p>}
                  </div>
                  <div>
                    <label className="ss-label">Fecha de nacimiento *</label>
                    <input className="ss-input" type="date" {...register("fecha_nacimiento", { required: true })} />
                    {errors.fecha_nacimiento && <p style={{ color: "#C97B5A", fontSize: "11px", marginTop: "4px" }}>Obligatorio</p>}
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label className="ss-label">Clase de interés *</label>
                  <select className="ss-input" style={{ cursor: "pointer" }} {...register("clase_interes", { required: true })}>
                    <option value="">Seleccionar</option>
                    <option>Barre</option>
                    <option>Pilates</option>
                    <option>Yoga</option>
                  </select>
                  {errors.clase_interes && <p style={{ color: "#C97B5A", fontSize: "11px", marginTop: "4px" }}>Obligatorio</p>}
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label className="ss-label">¿Cómo nos conociste? *</label>
                  <select className="ss-input" style={{ cursor: "pointer" }} {...register("como_nos_conocio", { required: true })}>
                    <option value="">Seleccionar</option>
                    <option>Instagram</option>
                    <option>TikTok</option>
                    <option>Recomendación de amigo/a</option>
                    <option>Google</option>
                    <option>Era alumno/a del estudio de baile</option>
                    <option>Otro</option>
                  </select>
                  {errors.como_nos_conocio && <p style={{ color: "#C97B5A", fontSize: "11px", marginTop: "4px" }}>Obligatorio</p>}
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label className="ss-label">Observaciones médicas o lesiones</label>
                  <textarea className="ss-input" rows={2} style={{ resize: "none", lineHeight: 1.6 }} placeholder="Opcional — lesiones o condiciones a tener en cuenta" {...register("observaciones_medicas")} />
                </div>

                {error && <p style={{ color: "#C97B5A", fontSize: "12px", marginBottom: "12px" }}>{error}</p>}
                <button type="submit" className="ss-btn" disabled={loading}>
                  {loading ? "Enviando..." : "Registrarme"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "52px", color: "#C97B5A", marginBottom: "16px" }}>✦</div>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 400, fontSize: "28px", color: "#2C2420", marginBottom: "12px" }}>
                ¡Bienvenido/a, {nombre}!
              </h2>
              <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "14px", color: "#9A8880", lineHeight: 1.7 }}>
                Tu registro fue recibido con éxito.<br />Pronto nos pondremos en contacto contigo. 🌸
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
