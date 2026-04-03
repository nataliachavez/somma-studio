"use client";
import { useEffect, useState } from "react";
import { Alumna, Inscripcion } from "@/lib/types";
import { diasHastaVencimiento, esCumpleanosHoy, cumpleanosEsteMes, formatMoneda, formatFecha } from "@/lib/utils";
import { differenceInDays, parseISO, subDays, format } from "date-fns";
import { es } from "date-fns/locale";

export default function DashboardPage() {
  const [alumnas, setAlumnas]             = useState<Alumna[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/alumnas").then(r => r.json()),
      fetch("/api/admin/inscripciones").then(r => r.json()),
    ]).then(([a, i]) => {
      setAlumnas(a.alumnas ?? []);
      setInscripciones(i.inscripciones ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const hoy       = new Date();
  const hace15    = subDays(hoy, 15);
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();

  const activas          = alumnas.filter(a => a.activa && a.tipo_alumna === "regular");
  const prueba           = alumnas.filter(a => a.tipo_alumna === "prueba");
  const nuevasEsteMes    = alumnas.filter(a => { const d = new Date(a.created_at); return d.getMonth() === mesActual && d.getFullYear() === añoActual; });
  const bdayHoy          = alumnas.filter(a => a.fecha_nacimiento && esCumpleanosHoy(a.fecha_nacimiento));
  const bdayMes          = alumnas.filter(a => a.fecha_nacimiento && cumpleanosEsteMes(a.fecha_nacimiento));
  const proxRenovaciones = inscripciones.filter(i => { if (i.estado !== "activa" || !i.fecha_vencimiento) return false; const d = diasHastaVencimiento(i.fecha_vencimiento); return d !== null && d >= 0 && d <= 15; });
  const ingresosMes      = inscripciones.filter(i => { const d = new Date(i.fecha_inicio); return d.getMonth() === mesActual && d.getFullYear() === añoActual; }).reduce((s, i) => s + (i.monto_pagado ?? 0), 0);

  // Registros últimos 15 días
  const recientes = alumnas.filter(a => {
    const d = new Date(a.created_at);
    return d >= hace15;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Buscar inscripción de una alumna
  const inscripcionDeAlumna = (alumnaId: string) =>
    inscripciones.find(i => i.alumna_id === alumnaId && i.estado === "activa");

  const S = ({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) => (
    <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1rem 1.25rem" }}>
      <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "30px", fontWeight: 400, color: accent ? "#C97B5A" : "#2C2420", lineHeight: 1 }}>{loading ? "—" : value}</p>
      {sub && <p style={{ fontSize: "11px", color: "#9A8880", marginTop: "4px" }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 400, fontSize: "24px", color: "#2C2420" }}>
          Dashboard <span style={{ fontStyle: "italic", color: "#C97B5A" }}>general</span>
        </h1>
        <p style={{ fontSize: "12px", color: "#9A8880", marginTop: "4px", fontFamily: "'Jost',sans-serif", fontWeight: 300 }}>
          {format(hoy, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "1.25rem" }}>
        <S label="Ingresos del mes"  value={formatMoneda(ingresosMes)} sub="pagos registrados" accent />
        <S label="Alumnas activas"   value={activas.length}            sub={`de ${alumnas.length} total`} />
        <S label="Clases de prueba"  value={prueba.length}             sub="actualmente" />
        <S label="Nuevos este mes"   value={nuevasEsteMes.length}      sub="registros" />
      </div>

      {/* Alertas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.25rem" }}>

        {/* Próximas renovaciones */}
        <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "12px" }}>Renovaciones próximas · 15 días</p>
          {loading ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Cargando...</p> :
           proxRenovaciones.length === 0
             ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Sin renovaciones próximas ✓</p>
             : proxRenovaciones.slice(0, 6).map(i => {
               const dias = diasHastaVencimiento(i.fecha_vencimiento!);
               const alumna = alumnas.find(a => a.id === i.alumna_id);
               return (
                 <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "0.5px solid #F0EDE8" }}>
                   <div>
                     <p style={{ fontSize: "13px", fontWeight: 400, color: "#2C2420" }}>{alumna ? `${alumna.nombre} ${alumna.apellido}` : "—"}</p>
                     <p style={{ fontSize: "11px", color: "#9A8880" }}>{i.planes?.nombre}</p>
                   </div>
                   <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", background: dias! <= 3 ? "#FCEBEB" : "#FFF8E8", color: dias! <= 3 ? "#7A2525" : "#7A6020", flexShrink: 0 }}>
                     {dias === 0 ? "hoy" : `${dias}d`}
                   </span>
                 </div>
               );
             })}
        </div>

        {/* Cumpleaños del mes */}
        <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "12px" }}>Cumpleaños del mes 🎂</p>
          {loading ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Cargando...</p> :
           bdayMes.length === 0
             ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Sin cumpleaños este mes</p>
             : bdayMes.map(a => (
               <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "0.5px solid #F0EDE8" }}>
                 <div>
                   <p style={{ fontSize: "13px", fontWeight: 400, color: "#2C2420" }}>{a.nombre} {a.apellido}</p>
                   <p style={{ fontSize: "11px", color: "#9A8880" }}>{a.fecha_nacimiento ? format(parseISO(a.fecha_nacimiento), "d 'de' MMMM", { locale: es }) : ""}</p>
                 </div>
                 {esCumpleanosHoy(a.fecha_nacimiento!) && (
                   <button onClick={async () => {
                     await fetch("/api/email/birthday", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: a.nombre, email: a.email }) });
                     alert(`¡Email enviado a ${a.nombre}!`);
                   }} style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", background: "#C97B5A", color: "#FAF8F5", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontFamily: "'Jost',sans-serif", flexShrink: 0 }}>
                     Saludar
                   </button>
                 )}
               </div>
             ))}
        </div>
      </div>

      {/* Registros recientes — últimos 15 días */}
      <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880" }}>
            Registros últimos 15 días
          </p>
          <span style={{ fontSize: "11px", color: "#C97B5A" }}>{recientes.length} alumno/a{recientes.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Encabezado tabla */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 0.8fr 0.8fr", gap: "8px", padding: "8px 0", borderBottom: "0.5px solid #E8E0D8", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880" }}>
          <span>Alumno/a</span><span>Email</span><span>Clase</span><span>Fecha registro</span><span>Monto</span><span>Tipo</span>
        </div>

        {loading && <p style={{ fontSize: "13px", color: "#9A8880", padding: "12px 0" }}>Cargando...</p>}
        {!loading && recientes.length === 0 && <p style={{ fontSize: "13px", color: "#9A8880", padding: "12px 0" }}>Sin registros en los últimos 15 días.</p>}
        {!loading && recientes.map(a => {
          const ins = inscripcionDeAlumna(a.id);
          const diasDesdeRegistro = differenceInDays(hoy, new Date(a.created_at));
          const esNuevo = diasDesdeRegistro <= 15;
          return (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 0.8fr 0.8fr", gap: "8px", padding: "10px 0", borderBottom: "0.5px solid #F5F3EF", alignItems: "center" }}>
              <p style={{ fontSize: "13px", fontWeight: 400, color: "#2C2420" }}>{a.nombre} {a.apellido}</p>
              <p style={{ fontSize: "11px", color: "#9A8880" }}>{a.email}</p>
              <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", display: "inline-block", background: (a as any).clase_interes === "Barre" ? "#F0EBE1" : (a as any).clase_interes === "Pilates" ? "#E8EFF5" : "#EAF3DE", color: (a as any).clase_interes === "Barre" ? "#7A6140" : (a as any).clase_interes === "Pilates" ? "#3A5A75" : "#3B6D11" }}>
                {(a as any).clase_interes ?? a.estudio}
              </span>
              <p style={{ fontSize: "11px", color: "#9A8880" }}>{formatFecha(a.created_at)}</p>
              <p style={{ fontSize: "12px", color: "#2C2420", fontWeight: 400 }}>{ins?.monto_pagado ? formatMoneda(ins.monto_pagado) : "—"}</p>
              <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", display: "inline-block", background: esNuevo ? "#EAF3DE" : "#F0EBE1", color: esNuevo ? "#3B6D11" : "#7A6140" }}>
                {esNuevo ? "Nuevo/a" : "Antiguo/a"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
