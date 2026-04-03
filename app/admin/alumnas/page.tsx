"use client";
import { useEffect, useState } from "react";
import { Alumna } from "@/lib/types";
import { formatFecha, esCumpleanosHoy } from "@/lib/utils";

export default function AlumnasPage() {
  const [alumnas, setAlumnas] = useState<Alumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [tab, setTab]         = useState("todas");

  useEffect(() => {
    fetch("/api/alumnas").then(r => r.json()).then(d => { setAlumnas(d.alumnas ?? []); setLoading(false); });
  }, []);

  const filtered = alumnas.filter(a => {
  const matchTab = tab === "todas" ? true : tab === "barre" ? ((a as any).clase_interes === "Barre" || a.estudio === "Barre") : tab === "pilates" ? ((a as any).clase_interes === "Pilates") : tab === "yoga" ? ((a as any).clase_interes === "Yoga") : tab === "prueba" ? a.tipo_alumna === "prueba" : tab === "bday" ? (a.fecha_nacimiento ? esCumpleanosHoy(a.fecha_nacimiento) : false) : true;    const matchSearch = search ? `${a.nombre} ${a.apellido} ${a.email}`.toLowerCase().includes(search.toLowerCase()) : true;
    return matchTab && matchSearch;
  });

const tabs = [
  { id: "todas",   label: "Todas" },
  { id: "barre",   label: "Barre" },
  { id: "pilates", label: "Pilates" },
  { id: "yoga",    label: "Yoga" },
  { id: "prueba",  label: "Prueba" },
  { id: "bday",    label: "Cumpleaños hoy" },
];

  const estBadge = (e: string) => {
    const map: Record<string, [string, string]> = { Barre: ["#F0EBE1","#7A6140"], Baile: ["#E8EFF5","#3A5A75"], Ambos: ["#EEE8F2","#5A3A75"] };
    const [bg, color] = map[e] ?? ["#F0EDE8","#5A5855"];
    return <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "20px", background: bg, color, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{e}</span>;
  };

  const nivelBadge = (n: string) => {
    const map: Record<string, [string, string]> = { Principiante: ["#F0F5E8","#4A6A25"], Intermedio: ["#FFF8E8","#7A6020"], Avanzado: ["#F5E8E8","#7A2525"] };
    const [bg, color] = map[n] ?? ["#F0EDE8","#5A5855"];
    return <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "20px", background: bg, color, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{n}</span>;
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "26px", color: "#2C2420" }}>
          Alumnas <span style={{ fontStyle: "italic", color: "#C97B5A" }}>registradas</span>
        </h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: "12px", padding: "7px 14px", border: "0.5px solid #E8E0D8", borderRadius: "4px", outline: "none", background: "#FAF8F5", width: "180px" }} />
          <a href="/register" target="_blank" style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "7px 16px", background: "#1E1C19", color: "#FAF8F5", borderRadius: "4px", textDecoration: "none", display: "flex", alignItems: "center" }}>
            + Nueva
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "1.25rem" }}>
        {[
          { label: "Total", val: alumnas.length },
          { label: "Activas", val: alumnas.filter(a => a.activa).length },
          { label: "Prueba", val: alumnas.filter(a => a.tipo_alumna === "prueba").length },
          { label: "Inactivas", val: alumnas.filter(a => !a.activa).length },
        ].map(s => (
          <div key={s.label} style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "8px", padding: "12px 16px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "6px" }}>{s.label}</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "28px", fontWeight: 300, color: "#2C2420", lineHeight: 1 }}>{loading ? "—" : s.val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 16px", border: `0.5px solid ${tab === t.id ? "#C97B5A" : "#E8E0D8"}`, borderRadius: "20px", background: tab === t.id ? "#FAF0E8" : "transparent", color: tab === t.id ? "#C97B5A" : "#8A8880", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr", gap: "8px", padding: "10px 16px", background: "#F0EDE8", borderBottom: "0.5px solid #E8E0D8", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9A8880" }}>
          <span>Alumna</span><span>Teléfono</span><span>Estudio</span><span>Nivel</span><span>Registrada</span><span>Estado</span>
        </div>
        {loading && <p style={{ padding: "16px", fontSize: "13px", color: "#9A8880" }}>Cargando...</p>}
        {!loading && filtered.length === 0 && <p style={{ padding: "16px", fontSize: "13px", color: "#9A8880" }}>No se encontraron alumnas.</p>}
        {!loading && filtered.map(a => (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr", gap: "8px", padding: "11px 16px", borderBottom: "0.5px solid #F5F3EF", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 400, color: "#2C2420" }}>{a.nombre} {a.apellido}</p>
              <p style={{ fontSize: "11px", color: "#9A8880" }}>{a.email}</p>
            </div>
            <p style={{ fontSize: "12px", color: "#7A7875" }}>{a.telefono}</p>
            <span>{estBadge(a.estudio)}</span>
            <span>{nivelBadge(a.nivel)}</span>
            <p style={{ fontSize: "11px", color: "#9A8880" }}>{formatFecha(a.created_at)}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: a.activa ? "#7DAA58" : "#C97B5A", display: "inline-block" }} />
              <span style={{ fontSize: "11px", color: a.activa ? "#6A9A48" : "#9A8880" }}>{a.activa ? "Activa" : "Inactiva"}</span>
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: "8px", fontSize: "11px", color: "#9A8880" }}>{filtered.length} alumna{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
