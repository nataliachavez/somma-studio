"use client";
import { useEffect, useState } from "react";
import { Clase, Coach, TipoClase } from "@/lib/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, parseISO, isBefore } from "date-fns";
import { es } from "date-fns/locale";

type Modal = { open: boolean; fecha?: string };

export default function ClasesPage() {
  const [clases, setClases]       = useState<Clase[]>([]);
  const [coaches, setCoaches]     = useState<Coach[]>([]);
  const [tipos, setTipos]         = useState<TipoClase[]>([]);
  const [loading, setLoading]     = useState(true);
  const [mes, setMes]             = useState(new Date());
  const [modal, setModal]         = useState<Modal>({ open: false });
  const [vista, setVista]         = useState<"calendario" | "historial">("calendario");

  // Form state
  const [form, setForm] = useState({
    tipo_clase_id: "", coach_id: "", fecha: "", hora_inicio: "", duracion: "60",
    cupo_maximo: "10", etiqueta: "", es_recurrente: false,
  });
  const [saving, setSaving] = useState(false);

  const cargar = () => {
    Promise.all([
      fetch("/api/admin/clases").then(r => r.json()),
      fetch("/api/admin/coaches").then(r => r.json()),
      fetch("/api/admin/tipos-clase").then(r => r.json()),
    ]).then(([c, co, t]) => {
      setClases(c.clases ?? []);
      setCoaches(co.coaches ?? []);
      setTipos(t.tipos ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { cargar(); }, []);

  // Días del mes actual
  const diasMes     = eachDayOfInterval({ start: startOfMonth(mes), end: endOfMonth(mes) });
  const primerDia   = getDay(startOfMonth(mes)); // 0=Dom
  const offsetLunes = primerDia === 0 ? 6 : primerDia - 1;

  const clasesDia = (fecha: Date) =>
    clases.filter(c => c.fecha === format(fecha, "yyyy-MM-dd"))
          .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const calcularHoraFin = (inicio: string, minutos: string) => {
    if (!inicio) return "";
    const [h, m] = inicio.split(":").map(Number);
    const total  = h * 60 + m + parseInt(minutos);
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  const guardarClase = async () => {
    setSaving(true);
    const hora_fin = calcularHoraFin(form.hora_inicio, form.duracion);
    await fetch("/api/admin/clases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, hora_fin, cupo_disponible: parseInt(form.cupo_maximo) }),
    });
    setModal({ open: false });
    setForm({ tipo_clase_id: "", coach_id: "", fecha: "", hora_inicio: "", duracion: "60", cupo_maximo: "10", etiqueta: "", es_recurrente: false });
    cargar();
    setSaving(false);
  };

  const clasesHistorial = clases
    .filter(c => isBefore(parseISO(c.fecha), new Date()))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 400, fontSize: "24px", color: "#2C2420" }}>
          Clases <span style={{ fontStyle: "italic", color: "#C97B5A" }}>programadas</span>
        </h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setVista(vista === "calendario" ? "historial" : "calendario")}
            style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 14px", border: "0.5px solid #E8E0D8", borderRadius: "4px", background: "transparent", color: "#8A8880", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>
            {vista === "calendario" ? "Ver historial" : "Ver calendario"}
          </button>
          <button onClick={() => setModal({ open: true, fecha: format(new Date(), "yyyy-MM-dd") })}
            style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 16px", background: "#2C2420", color: "#FAF8F5", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>
            + Nueva clase
          </button>
        </div>
      </div>

      {vista === "calendario" ? (
        <>
          {/* Navegación de mes */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <button onClick={() => setMes(subMonths(mes, 1))} style={{ border: "0.5px solid #E8E0D8", background: "transparent", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>←</button>
            <span style={{ fontFamily: "'Libre Baskerville',serif", fontSize: "16px", color: "#2C2420", minWidth: "160px", textAlign: "center" }}>
              {format(mes, "MMMM yyyy", { locale: es })}
            </span>
            <button onClick={() => setMes(addMonths(mes, 1))} style={{ border: "0.5px solid #E8E0D8", background: "transparent", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>→</button>
            <button onClick={() => setMes(new Date())} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", border: "0.5px solid #C97B5A", color: "#C97B5A", background: "transparent", padding: "5px 12px", borderRadius: "4px", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>Hoy</button>
          </div>

          {/* Calendario */}
          <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", overflow: "hidden" }}>
            {/* Cabecera días */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "0.5px solid #E8E0D8" }}>
              {DIAS.map(d => (
                <div key={d} style={{ padding: "8px", textAlign: "center", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A8880", background: "#F0EDE8" }}>{d}</div>
              ))}
            </div>
            {/* Grid días */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
              {Array.from({ length: offsetLunes }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: "110px", borderRight: "0.5px solid #F0EDE8", borderBottom: "0.5px solid #F0EDE8", background: "#FAFAF8" }} />
              ))}
              {diasMes.map(dia => {
                const esHoy    = format(dia, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                const clasesD  = clasesDia(dia);
                const pasado   = isBefore(dia, new Date()) && !esHoy;
                return (
                  <div key={dia.toISOString()} onClick={() => setModal({ open: true, fecha: format(dia, "yyyy-MM-dd") })}
                    style={{ minHeight: "110px", borderRight: "0.5px solid #F0EDE8", borderBottom: "0.5px solid #F0EDE8", padding: "6px", cursor: "pointer", background: esHoy ? "#FFF8F5" : "transparent", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F8F5F2")}
                    onMouseLeave={e => (e.currentTarget.style.background = esHoy ? "#FFF8F5" : "transparent")}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: esHoy ? 500 : 400, color: esHoy ? "#C97B5A" : pasado ? "#C0BDB8" : "#2C2420", background: esHoy ? "#FAF0E8" : "transparent", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {format(dia, "d")}
                      </span>
                      {clasesD.length > 0 && <span style={{ fontSize: "9px", color: "#C97B5A" }}>{clasesD.length}</span>}
                    </div>
                    {clasesD.slice(0, 3).map(c => (
                      <div key={c.id} style={{ fontSize: "10px", padding: "2px 5px", marginBottom: "2px", borderRadius: "3px", background: c.etiqueta ? "#FFF8E8" : "#F0F5E8", color: c.etiqueta ? "#7A6020" : "#3B6D11", borderLeft: `2px solid ${c.tipos_clase?.color ?? "#C97B5A"}`, lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {c.hora_inicio?.slice(0, 5)} {c.tipos_clase?.nombre?.split(" ")[0]}
                        {c.etiqueta && <span style={{ marginLeft: "3px", opacity: 0.7 }}>★</span>}
                      </div>
                    ))}
                    {clasesD.length > 3 && <span style={{ fontSize: "9px", color: "#9A8880" }}>+{clasesD.length - 3} más</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ display: "flex", gap: "16px", marginTop: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "12px", height: "8px", background: "#F0F5E8", border: "0.5px solid #E8E0D8", borderRadius: "2px", display: "inline-block" }} /><span style={{ fontSize: "10px", color: "#9A8880" }}>Clase regular</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "12px", height: "8px", background: "#FFF8E8", border: "0.5px solid #E8E0D8", borderRadius: "2px", display: "inline-block" }} /><span style={{ fontSize: "10px", color: "#9A8880" }}>Clase con etiqueta / promo</span></div>
          </div>
        </>
      ) : (
        /* Historial */
        <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 0.8fr 0.8fr 1fr", gap: "8px", padding: "10px 16px", background: "#F0EDE8", borderBottom: "0.5px solid #E8E0D8", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880" }}>
            <span>Fecha</span><span>Horario</span><span>Clase</span><span>Coach</span><span>Inscriptos</span><span>Asistentes</span><span>Etiqueta</span>
          </div>
          {clasesHistorial.length === 0 && <p style={{ padding: "16px", fontSize: "13px", color: "#9A8880" }}>No hay clases pasadas aún.</p>}
          {clasesHistorial.map(c => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 0.8fr 0.8fr 1fr", gap: "8px", padding: "10px 16px", borderBottom: "0.5px solid #F5F3EF", alignItems: "center" }}>
              <p style={{ fontSize: "12px", color: "#2C2420" }}>{format(parseISO(c.fecha), "d MMM yyyy", { locale: es })}</p>
              <p style={{ fontSize: "11px", color: "#9A8880" }}>{c.hora_inicio?.slice(0, 5)} – {c.hora_fin?.slice(0, 5)}</p>
              <p style={{ fontSize: "12px", color: "#2C2420" }}>{c.tipos_clase?.nombre}</p>
              <p style={{ fontSize: "11px", color: "#9A8880" }}>{c.coaches?.nombre} {c.coaches?.apellido}</p>
              <p style={{ fontSize: "12px", color: "#2C2420", textAlign: "center" }}>{c.cupo_maximo - c.cupo_disponible}</p>
              <p style={{ fontSize: "12px", color: "#2C2420", textAlign: "center" }}>{(c as any).asistentes_real ?? "—"}</p>
              {c.etiqueta
                ? <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", background: "#FFF8E8", color: "#7A6020" }}>{c.etiqueta}</span>
                : <span style={{ fontSize: "10px", color: "#C0BDB8" }}>—</span>}
            </div>
          ))}
        </div>
      )}

      {/* Modal nueva clase */}
      {modal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#FAF8F5", borderRadius: "12px", padding: "2rem", width: "480px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontFamily: "'Libre Baskerville',serif", fontWeight: 400, fontSize: "20px", color: "#2C2420", marginBottom: "4px" }}>Nueva clase</h2>
            <p style={{ fontSize: "12px", color: "#9A8880", marginBottom: "1.5rem" }}>
              {modal.fecha ? format(parseISO(modal.fecha), "EEEE d 'de' MMMM", { locale: es }) : ""}
            </p>

            <div style={{ marginBottom: "14px" }}>
              <label className="ss-label">Tipo de clase *</label>
              <select className="ss-input" style={{ cursor: "pointer" }} value={form.tipo_clase_id} onChange={e => setForm({ ...form, tipo_clase_id: e.target.value })}>
                <option value="">Seleccionar</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label className="ss-label">Coach *</label>
              <select className="ss-input" style={{ cursor: "pointer" }} value={form.coach_id} onChange={e => setForm({ ...form, coach_id: e.target.value })}>
                <option value="">Seleccionar</option>
                {coaches.filter(c => c.activa).map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label className="ss-label">Fecha *</label>
              <input className="ss-input" type="date" value={form.fecha || modal.fecha || ""} onChange={e => setForm({ ...form, fecha: e.target.value })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label className="ss-label">Hora de inicio *</label>
                <input className="ss-input" type="time" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} />
              </div>
              <div>
                <label className="ss-label">Duración (minutos)</label>
               <select className="ss-input" style={{ cursor: "pointer" }} value={form.duracion} onChange={e => setForm({ ...form, duracion: e.target.value })}>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="50">50 min</option>
                <option value="60">60 min</option>
              </select>
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label className="ss-label">Cupo máximo</label>
              <input className="ss-input" type="number" min="1" max="50" value={form.cupo_maximo} onChange={e => setForm({ ...form, cupo_maximo: e.target.value })} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="ss-label">Etiqueta / Promoción (opcional)</label>
              <input className="ss-input" type="text" placeholder="ej: Promoción Abril, Semana de lanzamiento..." value={form.etiqueta} onChange={e => setForm({ ...form, etiqueta: e.target.value })} />
              <p style={{ fontSize: "10px", color: "#9A8880", marginTop: "4px" }}>Sirve para medir inscripciones por campaña</p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setModal({ open: false })} style={{ flex: 1, padding: "12px", border: "0.5px solid #E8E0D8", background: "transparent", color: "#9A8880", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: "4px", fontFamily: "'Jost',sans-serif" }}>
                Cancelar
              </button>
              <button onClick={guardarClase} disabled={saving || !form.tipo_clase_id || !form.coach_id || !form.hora_inicio}
                style={{ flex: 2, padding: "12px", background: saving ? "#9A8880" : "#2C2420", color: "#FAF8F5", border: "none", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", borderRadius: "4px", fontFamily: "'Jost',sans-serif", transition: "background 0.2s" }}>
                {saving ? "Guardando..." : "Guardar clase"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
