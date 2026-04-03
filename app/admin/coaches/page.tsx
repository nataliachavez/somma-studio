"use client";
import { useEffect, useState } from "react";
import { Coach } from "@/lib/types";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/coaches").then(r => r.json()).then(d => { setCoaches(d.coaches ?? []); setLoading(false); });
  }, []);

  const initiales = (nombre: string, apellido: string) =>
    `${nombre[0]}${apellido[0]}`.toUpperCase();

  const colors = ["#FAF0E8","#E8EFF5","#EAF3DE","#EEE8F2","#F0EBE1"];
  const textColors = ["#854F0B","#185FA5","#3B6D11","#534AB7","#7A6140"];

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "26px", color: "#2C2420" }}>
          Coaches <span style={{ fontStyle: "italic", color: "#C97B5A" }}>del estudio</span>
        </h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
        {loading ? <p style={{ fontSize: "13px", color: "#9A8880" }}>Cargando...</p> :
         coaches.length === 0 ? <p style={{ fontSize: "13px", color: "#9A8880" }}>No hay coaches registrados aún.</p> :
         coaches.map((c, i) => (
           <div key={c.id} style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1.25rem" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
               <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: colors[i % colors.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 500, color: textColors[i % textColors.length], flexShrink: 0 }}>
                 {initiales(c.nombre, c.apellido)}
               </div>
               <div>
                 <p style={{ fontSize: "15px", fontWeight: 400, color: "#2C2420" }}>{c.nombre} {c.apellido}</p>
                 <p style={{ fontSize: "11px", color: "#9A8880" }}>{c.email}</p>
               </div>
             </div>
             {c.bio && <p style={{ fontSize: "12px", color: "#9A8880", lineHeight: 1.6, marginBottom: "10px" }}>{c.bio}</p>}
             <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px" }}>
               {c.especialidad?.map(e => (
                 <span key={e} style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "20px", background: "#F0EBE1", color: "#7A6140", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{e}</span>
               ))}
             </div>
             {c.telefono && <p style={{ fontSize: "11px", color: "#9A8880", marginTop: "8px" }}>{c.telefono}</p>}
           </div>
         ))}
      </div>
    </div>
  );
}
