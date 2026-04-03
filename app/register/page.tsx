"use client";
import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";

type FormData = {
  nombre: string; apellido: string; email: string; telefono: string;
  fecha_nacimiento: string; estudio: string; nivel: string;
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
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>

      {/* Panel izquierdo — salmón con logo */}
      <div style={{ backgroundColor: "#C97B5A", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "4rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "220px", height: "220px", borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.15)" }} />
        <div style={{ position: "absolute", bottom: "80px", left: "-40px", width: "140px", height: "140px", borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.1)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Image src="/logo.png" alt="Somma Studio" width={240} height={240} style={{ objectFit: "contain" }} priority />
          <div style={{ width: "40px", height: "0.5px", background: "rgba(255,255,255,0.5)", margin: "2rem 0" }} />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "18px", color: "rgba(255,255,255,0.85)", textAlign: "center", maxWidth: "280px", lineHeight: 1.7 }}>
            "El cuerpo dice lo que las palabras no pueden expresar."
          </p>
          <p style={{ marginTop: "2rem", fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
            Lima, Perú
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{ background: "#FAF8F5", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem 3.5rem", overflowY: "auto" }}>
        {!submitted ? (
          <>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "28px", color: "#2C2420", marginBottom: "4px" }}>
              Únete a nosotras
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
                  <input className="ss-input" type="tel" placeholder="+51 999 000 000" {...register("telefono", { required: true })} />
                </div>
                <div>
                  <label className="ss-label">Fecha de nacimiento *</label>
                  <input className="ss-input" type="date" {...register("fecha_nacimiento", { required: true })} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="ss-label">Estudio de interés *</label>
                  <select className="ss-input" style={{ cursor: "pointer" }} {...register("estudio", { required: true })}>
                    <option value="">Seleccionar</option>
                    <option>Barre</option><option>Baile</option><option>Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="ss-label">Nivel *</label>
                  <select className="ss-input" style={{ cursor: "pointer" }} {...register("nivel", { required: true })}>
                    <option value="">Seleccionar</option>
                    <option>Principiante</option><option>Intermedio</option><option>Avanzado</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="ss-label">¿Cómo nos conociste? *</label>
                <select className="ss-input" style={{ cursor: "pointer" }} {...register("como_nos_conocio", { required: true })}>
                  <option value="">Seleccionar</option>
                  <option>Instagram</option><option>TikTok</option>
                  <option>Recomendación de amiga</option><option>Google</option><option>Otro</option>
                </select>
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
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "56px", color: "#C97B5A", marginBottom: "16px" }}>✦</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "30px", color: "#2C2420", marginBottom: "8px" }}>
              ¡Bienvenida, {nombre}!
            </h2>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "14px", color: "#9A8880", lineHeight: 1.7 }}>
              Tu registro fue recibido con éxito.<br />Pronto nos pondremos en contacto contigo. 🌸
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
