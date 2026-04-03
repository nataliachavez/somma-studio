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
    fetch("/api/alumnas").then(r => r.json()).then(d => {
      setAlumnas(d.alumnas ?? []);
      setLoading(false);
    });
  }, []);

  const getClaseInteres = (a: any) => a.clase_interes ?? a.estudio ?? "—";

  const filtered = alumnas.filter(a => {
    const ci = getClaseInteres(a).toLowerCase();
    const matchTab =
      tab === "todas"   ? true :
      tab === "barre"   ? ci === "barre" :
      tab === "pilates" ? ci === "pilates" :
      tab === "yoga"    ? ci === "yoga" :
      tab === "prueba"  ? a.tipo_alumna === "prueba" :
      tab === "bday"    ? (a.fecha_nacimiento ? esCumpleanosHoy(a.fecha_nacimiento) : false) :
      true;
    const matchSearch = search
      ? `${a.nombre} ${a.apellido} ${a.email}`.toLowerCase().includes(search.toLowerCase())
      : true;
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

  const claseBadge = (ci: string) => {
    const map: Record<string, [string, string]> = {
      barre:   ["#F0EBE1","#7A6140"],
      pilates: ["#E8EFF5","#3A5A75"],
      yoga:    ["#EAF3DE","#3B6D11"],
    };
    const [bg, color] = map[ci.toLowerCase()] ?? ["#F0EDE8","#5A5855"];
    return (
      <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "20px", background: bg, color, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
        {ci}
      </span>
    );
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 400, fontSize: "24px", color: "#2C2420" }}>
          Alumnas <span style={{ fontStyle: "italic", color: "#C97B5A" }}>registradas</span>
        </h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{ fontFamily: "'Jost',sans-serif", fontWeight: 300, fontSize: "12px", padding: "7px 14px", border: "0.5px solid #E8E0D8", borderRadius: "4px", outline: "none", background: "#FAF8F5", width: "180px" }}
          />
          <a href="/register" target="_blank" style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "7px 16px", background: "#1E1C19", color: "#FAF8F5", borderRadius: "4px", textDecoration: "none", display: "flex", alignItems: "center" }}>
            + Nueva
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "1.25rem" }}>
        {[
          { label: "Total",    val: alumnas.length },
          { label: "Activas",  val: alumnas.filter(a => a.activa).length },
          { label: "Prueba",   val: alumnas.filter(a => a.tipo_alumna === "prueba").length },
          { label: "Inactivas",val: alumnas.filter(a => !a.activa).length },
        ].map(s => (
          <div key={s.label} style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "8px", padding: "12px 16px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "6px" }}>{s.label}</p>
            <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: "28px", fontWeight: 400, color: "#2C2420", lineHeight: 1 }}>{loading ? "—" : s.val}</p>
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
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", gap: "8px", padding: "10px 16px", background: "#F0EDE8", borderBottom: "0.5px solid #E8E0D8", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9A8880" }}>
          <span>Alumno/a</span><span>Teléfono</span><span>Clase</span><span>Cómo nos conoció</span><span>Estado</span>
        </div>
        {loading && <p style={{ padding: "16px", fontSize: "13px", color: "#9A8880" }}>Cargando...</p>}
        {!loading && filtered.length === 0 && <p style={{ padding: "16px", fontSize: "13px", color: "#9A8880" }}>No se encontraron registros.</p>}
        {!loading && filtered.map(a => (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", gap: "8px", padding: "11px 16px", borderBottom: "0.5px solid #F5F3EF", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 400, color: "#2C2420" }}>{a.nombre} {a.apellido}</p>
              <p style={{ fontSize: "11px", color: "#9A8880" }}>{a.email}</p>
            </div>
            <p style={{ fontSize: "12px", color: "#7A7875" }}>{a.telefono}</p>
            {claseBadge(getClaseInteres(a))}
            <p style={{ fontSize: "11px", color: "#9A8880" }}>{a.como_nos_conocio ?? "—"}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: a.activa ? "#7DAA58" : "#C97B5A", display: "inline-block" }} />
              <span style={{ fontSize: "11px", color: a.activa ? "#6A9A48" : "#9A8880" }}>{a.activa ? "Activo/a" : "Inactivo/a"}</span>
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: "8px", fontSize: "11px", color: "#9A8880" }}>{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
