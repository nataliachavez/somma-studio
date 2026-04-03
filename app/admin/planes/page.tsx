"use client";
import { useEffect, useState } from "react";
import { Plan } from "@/lib/types";
import { formatMoneda } from "@/lib/utils";

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/planes").then(r => r.json()).then(d => { setPlanes(d.planes ?? []); setLoading(false); });
  }, []);

  const tipoBadge = (t: string) => {
    const map: Record<string, [string,string]> = {
      mensual: ["#E8EFF5","#3A5A75"], trimestral: ["#EEE8F2","#5A3A75"],
      pack: ["#F0EBE1","#7A6140"], prueba: ["#EAF3DE","#4A6A25"], anual: ["#FAF0E8","#7A4020"],
    };
    const [bg, color] = map[t] ?? ["#F0EDE8","#5A5855"];
    return <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "20px", background: bg, color, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{t}</span>;
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "26px", color: "#2C2420" }}>
          Planes <span style={{ fontStyle: "italic", color: "#C97B5A" }}>disponibles</span>
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {loading ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Cargando...</p> :
         planes.map(p => (
           <div key={p.id} style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1.25rem", opacity: p.activo ? 1 : 0.5 }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
               <div>
                 <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 300, color: "#2C2420", marginBottom: "4px" }}>{p.nombre}</p>
                 {tipoBadge(p.tipo)}
               </div>
               <div style={{ textAlign: "right" }}>
                 <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "24px", fontWeight: 300, color: "#C97B5A" }}>{formatMoneda(p.precio)}</p>
                 {p.duracion_dias && <p style={{ fontSize: "10px", color: "#9A8880" }}>{p.duracion_dias} días</p>}
               </div>
             </div>
             {p.descripcion && <p style={{ fontSize: "12px", color: "#9A8880", lineHeight: 1.6, marginBottom: "12px" }}>{p.descripcion}</p>}
             <div style={{ borderTop: "0.5px solid #E8E0D8", paddingTop: "10px", display: "flex", gap: "16px" }}>
               <div>
                 <p style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A8880" }}>Estudio</p>
                 <p style={{ fontSize: "12px", color: "#2C2420", marginTop: "2px" }}>{p.estudio}</p>
               </div>
               <div>
                 <p style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A8880" }}>Clases</p>
                 <p style={{ fontSize: "12px", color: "#2C2420", marginTop: "2px" }}>{p.clases_incluidas ?? "Ilimitadas"}</p>
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
