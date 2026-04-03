"use client";
import { useEffect, useState } from "react";
import { Alumna, Inscripcion } from "@/lib/types";
import { diasHastaVencimiento, esCumpleanosHoy, cumpleanosEsteMes, formatMoneda, formatFecha } from "@/lib/utils";

export default function DashboardPage() {
  const [alumnas, setAlumnas]           = useState<Alumna[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading]           = useState(true);

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

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();

  // KPIs
  const activas       = alumnas.filter(a => a.activa && a.tipo_alumna === "regular");
  const prueba        = alumnas.filter(a => a.tipo_alumna === "prueba");
  const nuevasEsteMes = alumnas.filter(a => {
    const d = new Date(a.created_at);
    return d.getMonth() === mesActual && d.getFullYear() === añoActual;
  });
  const bdayHoy   = alumnas.filter(a => a.fecha_nacimiento && esCumpleanosHoy(a.fecha_nacimiento));
  const bdayMes   = alumnas.filter(a => a.fecha_nacimiento && cumpleanosEsteMes(a.fecha_nacimiento));
  const proxRenovaciones = inscripciones.filter(i => {
    if (i.estado !== "activa" || !i.fecha_vencimiento) return false;
    const dias = diasHastaVencimiento(i.fecha_vencimiento);
    return dias !== null && dias >= 0 && dias <= 15;
  });
  const ingresosMes = inscripciones
    .filter(i => { const d = new Date(i.fecha_inicio); return d.getMonth() === mesActual && d.getFullYear() === añoActual; })
    .reduce((sum, i) => sum + (i.monto_pagado ?? 0), 0);

  const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) => (
    <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1rem 1.25rem" }}>
      <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 300, color: color ?? "#2C2420", lineHeight: 1 }}>{loading ? "—" : value}</p>
      {sub && <p style={{ fontSize: "11px", color: "#C97B5A", marginTop: "4px" }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "26px", color: "#2C2420" }}>
          Dashboard <span style={{ fontStyle: "italic", color: "#C97B5A" }}>general</span>
        </h1>
        <p style={{ fontSize: "12px", color: "#9A8880", marginTop: "2px" }}>
          {hoy.toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPIs principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "1.5rem" }}>
        <StatCard label="Ingresos del mes"    value={formatMoneda(ingresosMes)} sub="pagos registrados" color="#2C2420" />
        <StatCard label="Alumnas activas"     value={activas.length}            sub={`de ${alumnas.length} total`} />
        <StatCard label="Clases de prueba"    value={prueba.length}             sub="en curso" />
        <StatCard label="Miembros nuevos"     value={nuevasEsteMes.length}      sub="este mes" />
      </div>

      {/* Alertas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>

        {/* Próximas renovaciones */}
        <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "12px" }}>
            Próximas renovaciones · 15 días
          </p>
          {loading ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Cargando...</p> :
           proxRenovaciones.length === 0 ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Sin renovaciones próximas</p> :
           proxRenovaciones.slice(0, 5).map(i => {
             const dias = diasHastaVencimiento(i.fecha_vencimiento!);
             return (
               <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "0.5px solid #F0EDE8" }}>
                 <div>
                   <p style={{ fontSize: "13px", fontWeight: 400, color: "#2C2420" }}>{i.alumna_id}</p>
                   <p style={{ fontSize: "11px", color: "#9A8880" }}>{i.planes?.nombre}</p>
                 </div>
                 <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: dias! <= 3 ? "#FCEBEB" : "#FFF8E8", color: dias! <= 3 ? "#7A2525" : "#7A6020" }}>
                   {dias === 0 ? "hoy" : `${dias}d`}
                 </span>
               </div>
             );
           })}
        </div>

        {/* Cumpleaños */}
        <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "12px" }}>
            Cumpleaños del mes 🎂
          </p>
          {loading ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Cargando...</p> :
           bdayMes.length === 0 ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Sin cumpleaños este mes</p> :
           bdayMes.map(a => (
             <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "0.5px solid #F0EDE8" }}>
               <div>
                 <p style={{ fontSize: "13px", fontWeight: 400, color: "#2C2420" }}>{a.nombre} {a.apellido}</p>
                 <p style={{ fontSize: "11px", color: "#9A8880" }}>{a.fecha_nacimiento ? formatFecha(a.fecha_nacimiento) : ""}</p>
               </div>
               {esCumpleanosHoy(a.fecha_nacimiento!) && (
                 <button onClick={async () => {
                   await fetch("/api/email/birthday", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: a.nombre, email: a.email }) });
                   alert(`¡Email enviado a ${a.nombre}!`);
                 }} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", background: "#C97B5A", color: "#FAF8F5", border: "none", padding: "5px 12px", borderRadius: "4px", cursor: "pointer" }}>
                   Saludar
                 </button>
               )}
             </div>
           ))}
        </div>
      </div>

      {/* Alumnas recientes */}
      <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1rem 1.25rem" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "12px" }}>Registros recientes</p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr", gap: "8px", padding: "8px 0", borderBottom: "0.5px solid #E8E0D8", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880" }}>
          <span>Alumna</span><span>Email</span><span>Estudio</span><span>Registrada</span>
        </div>
        {loading ? <p style={{ fontSize: "13px", color: "#9A8880", padding: "12px 0" }}>Cargando...</p> :
         alumnas.slice(0, 8).map(a => (
           <div key={a.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr", gap: "8px", padding: "10px 0", borderBottom: "0.5px solid #F5F3EF", alignItems: "center" }}>
             <p style={{ fontSize: "13px", fontWeight: 400, color: "#2C2420" }}>{a.nombre} {a.apellido}</p>
             <p style={{ fontSize: "11px", color: "#9A8880" }}>{a.email}</p>
             <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "20px", background: a.estudio === "Barre" ? "#F0EBE1" : a.estudio === "Baile" ? "#E8EFF5" : "#EEE8F2", color: a.estudio === "Barre" ? "#7A6140" : a.estudio === "Baile" ? "#3A5A75" : "#5A3A75", display: "inline-block" }}>
               {a.estudio}
             </span>
             <p style={{ fontSize: "11px", color: "#9A8880" }}>{formatFecha(a.created_at)}</p>
           </div>
         ))}
      </div>
    </div>
  );
}
