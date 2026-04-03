"use client";
import { useEffect, useState } from "react";
import { Clase } from "@/lib/types";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function ClasesPage() {
  const [clases, setClases]   = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [semana, setSemana]   = useState(new Date());

  const lunesSemana = startOfWeek(semana, { weekStartsOn: 1 });
  const diasSemana  = Array.from({ length: 7 }, (_, i) => addDays(lunesSemana, i));

  useEffect(() => {
    fetch("/api/admin/clases").then(r => r.json()).then(d => { setClases(d.clases ?? []); setLoading(false); });
  }, []);

  const clasesDia = (fecha: Date) =>
    clases.filter(c => c.fecha === format(fecha, "yyyy-MM-dd"));

  const cupoColor = (disponible: number, maximo: number) => {
    const pct = disponible / maximo;
    if (pct === 0) return "#FCEBEB";
    if (pct <= 0.3) return "#FFF8E8";
    return "#EAF3DE";
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "26px", color: "#2C2420" }}>
          Clases <span style={{ fontStyle: "italic", color: "#C97B5A" }}>programadas</span>
        </h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => setSemana(addDays(semana, -7))} style={{ border: "0.5px solid #E8E0D8", background: "transparent", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>←</button>
          <span style={{ fontSize: "12px", color: "#9A8880", minWidth: "140px", textAlign: "center" }}>
            {format(lunesSemana, "d MMM", { locale: es })} – {format(diasSemana[6], "d MMM yyyy", { locale: es })}
          </span>
          <button onClick={() => setSemana(addDays(semana, 7))} style={{ border: "0.5px solid #E8E0D8", background: "transparent", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>→</button>
          <button onClick={() => setSemana(new Date())} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", border: "0.5px solid #C97B5A", color: "#C97B5A", background: "transparent", padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>Hoy</button>
        </div>
      </div>

      {/* Calendario semanal */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
        {diasSemana.map(dia => {
          const esHoy = format(dia, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          const clasesDiaActual = clasesDia(dia);
          return (
            <div key={dia.toISOString()} style={{ background: "#FAF8F5", border: `0.5px solid ${esHoy ? "#C97B5A" : "#E8E0D8"}`, borderRadius: "8px", overflow: "hidden", minHeight: "200px" }}>
              <div style={{ padding: "8px 10px", background: esHoy ? "#FAF0E8" : "#F5F3EF", borderBottom: "0.5px solid #E8E0D8", textAlign: "center" }}>
                <p style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: esHoy ? "#C97B5A" : "#9A8880" }}>
                  {format(dia, "EEE", { locale: es })}
                </p>
                <p style={{ fontSize: "18px", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, color: esHoy ? "#C97B5A" : "#2C2420" }}>
                  {format(dia, "d")}
                </p>
              </div>
              <div style={{ padding: "8px" }}>
                {loading ? <p style={{ fontSize: "11px", color: "#C8C0B8" }}>...</p> :
                 clasesDiaActual.length === 0 ? <p style={{ fontSize: "11px", color: "#C8C0B8", textAlign: "center", marginTop: "8px" }}>Sin clases</p> :
                 clasesDiaActual.map(c => (
                   <div key={c.id} style={{ background: cupoColor(c.cupo_disponible, c.cupo_maximo), border: "0.5px solid #E8E0D8", borderRadius: "6px", padding: "6px 8px", marginBottom: "6px", borderLeft: `3px solid ${c.tipos_clase?.color ?? "#C97B5A"}` }}>
                     <p style={{ fontSize: "11px", fontWeight: 400, color: "#2C2420" }}>{c.tipos_clase?.nombre ?? "Clase"}</p>
                     <p style={{ fontSize: "10px", color: "#9A8880" }}>{c.hora_inicio} – {c.hora_fin}</p>
                     <p style={{ fontSize: "10px", color: "#9A8880" }}>{c.coaches?.nombre} {c.coaches?.apellido}</p>
                     <p style={{ fontSize: "10px", color: c.cupo_disponible === 0 ? "#7A2525" : "#6A9A48", marginTop: "2px" }}>
                       {c.cupo_disponible}/{c.cupo_maximo} cupos
                     </p>
                   </div>
                 ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div style={{ display: "flex", gap: "16px", marginTop: "12px", alignItems: "center" }}>
        <p style={{ fontSize: "10px", color: "#9A8880", letterSpacing: "0.05em" }}>Cupos:</p>
        {[["#EAF3DE","Disponibles"],["#FFF8E8","Casi lleno"],["#FCEBEB","Lleno"]].map(([bg, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "2px", background: bg, border: "0.5px solid #E8E0D8", display: "inline-block" }} />
            <span style={{ fontSize: "10px", color: "#9A8880" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
