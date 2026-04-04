"use client";
import { useEffect, useState } from "react";
import { Clase, Coach, TipoClase } from "@/lib/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, parseISO, isBefore } from "date-fns";
import { es } from "date-fns/locale";

type Modal = { open: boolean; fecha?: string };
type DetalleClase = {
  clase: Clase;
  reservas: Array<{
    id: string;
    estado: string;
    alumnas: { nombre: string; apellido: string; email: string; telefono: string; clase_interes: string };
  }>;
};

export default function ClasesPage() {
  const [clases, setClases]     = useState<Clase[]>([]);
  const [coaches, setCoaches]   = useState<Coach[]>([]);
  const [tipos, setTipos]       = useState<TipoClase[]>([]);
  const [loading, setLoading]   = useState(true);
  const [mes, setMes]           = useState(new Date());
  const [modal, setModal]       = useState<Modal>({ open: false });
  const [vista, setVista]       = useState<"calendario" | "historial">("calendario");
  const [saving, setSaving]     = useState(false);
  const [detalle, setDetalle]   = useState<DetalleClase | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [form, setForm] = useState({
    tipo_clase_id: "", coach_id: "", fecha: "", hora_inicio: "", duracion: "60",
    cupo_maximo: "10", etiqueta: "", es_recurrente: false,
  });

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

  const verDetalle = async (claseId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoadingDetalle(true);
    setDetalle(null);
    setEditando(false);
    const res = await fetch(`/api/admin/clases/${claseId}`);
    const json = await res.json();
    setDetalle(json);
    setEditForm({
      tipo_clase_id: json.clase.tipo_clase_id,
      coach_id:      json.clase.coach_id,
      fecha:         json.clase.fecha,
      hora_inicio:   json.clase.hora_inicio?.slice(0,5),
      hora_fin:      json.clase.hora_fin?.slice(0,5),
      cupo_maximo:   String(json.clase.cupo_maximo),
      etiqueta:      json.clase.etiqueta ?? "",
      estado:        json.clase.estado,
    });
    setLoadingDetalle(false);
  };

  const guardarEdicion = async () => {
    if (!detalle) return;
    setSavingEdit(true);
    const calcHoraFin = (inicio: string, fin: string) => fin || inicio;
    const res = await fetch(`/api/admin/clases/${detalle.clase.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, hora_fin: editForm.hora_fin }),
    });
    const json = await res.json();
    if (!res.ok) { alert("Error: " + json.error); setSavingEdit(false); return; }
    setEditando(false);
    cargar();
    verDetalle(detalle.clase.id);
    setSavingEdit(false);
  };

  const actualizarEstado = async (reservaId: string, estado: string, claseId: string) => {
    await fetch(`/api/admin/clases/${claseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reserva_id: reservaId, estado }),
    });
    verDetalle(claseId);
  };

  const diasMes     = eachDayOfInterval({ start: startOfMonth(mes), end: endOfMonth(mes) });
  const primerDia   = getDay(startOfMonth(mes));
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
    const fechaFinal = form.fecha || modal.fecha || "";
    if (!form.tipo_clase_id || !form.coach_id || !fechaFinal || !form.hora_inicio) {
      alert("Por favor completa: tipo de clase, coach, fecha y hora de inicio.");
      return;
    }
    setSaving(true);
    const hora_fin = calcularHoraFin(form.hora_inicio, form.duracion);
    const res = await fetch("/api/admin/clases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, fecha: fechaFinal, hora_fin }),
    });
    const json = await res.json();
    if (!res.ok) { alert("Error al guardar: " + json.error); setSaving(false); return; }
    setModal({ open: false });
    setForm({ tipo_clase_id: "", coach_id: "", fecha: "", hora_inicio: "", duracion: "60", cupo_maximo: "10", etiqueta: "", es_recurrente: false });
    cargar();
    setSaving(false);
  };

  const clasesHistorial = clases
    .filter(c => isBefore(parseISO(c.fecha), new Date()))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const clasesFuturas = clases
    .filter(c => !isBefore(parseISO(c.fecha), new Date()))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const estadoBadge = (estado: string) => {
    const map: Record<string, [string, string, string]> = {
      confirmada:   ["#E8EFF5", "#3A5A75", "Confirmada"],
      asistio:      ["#EAF3DE", "#3B6D11", "Asistió"],
      no_asistio:   ["#FCEBEB", "#7A2525", "No asistió"],
      cancelada:    ["#F0EDE8", "#7A7875", "Cancelada"],
      lista_espera: ["#FFF8E8", "#7A6020", "Lista espera"],
    };
    const [bg, color, label] = map[estado] ?? ["#F0EDE8", "#5A5855", estado];
    return <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "20px", background: bg, color, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{label}</span>;
  };

  const esFutura = detalle ? !isBefore(parseISO(detalle.clase.fecha), new Date()) : false;

  const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div style={{ padding: "1.5rem", display: "flex", gap: "1.5rem" }}>

      {/* Columna principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <button onClick={() => setMes(subMonths(mes, 1))} style={{ border: "0.5px solid #E8E0D8", background: "transparent", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>←</button>
              <span style={{ fontFamily: "'Libre Baskerville',serif", fontSize: "16px", color: "#2C2420", minWidth: "160px", textAlign: "center" }}>
                {format(mes, "MMMM yyyy", { locale: es })}
              </span>
              <button onClick={() => setMes(addMonths(mes, 1))} style={{ border: "0.5px solid #E8E0D8", background: "transparent", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>→</button>
              <button onClick={() => setMes(new Date())} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", border: "0.5px solid #C97B5A", color: "#C97B5A", background: "transparent", padding: "5px 12px", borderRadius: "4px", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>Hoy</button>
            </div>

            <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "0.5px solid #E8E0D8" }}>
                {DIAS.map(d => (
                  <div key={d} style={{ padding: "8px", textAlign: "center", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A8880", background: "#F0EDE8" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                {Array.from({ length: offsetLunes }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ minHeight: "100px", borderRight: "0.5px solid #F0EDE8", borderBottom: "0.5px solid #F0EDE8", background: "#FAFAF8" }} />
                ))}
                {diasMes.map(dia => {
                  const esHoy   = format(dia, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                  const clasesD = clasesDia(dia);
                  const pasado  = isBefore(dia, new Date()) && !esHoy;
                  return (
                    <div key={dia.toISOString()}
                      onClick={() => setModal({ open: true, fecha: format(dia, "yyyy-MM-dd") })}
                      style={{ minHeight: "100px", borderRight: "0.5px solid #F0EDE8", borderBottom: "0.5px solid #F0EDE8", padding: "6px", cursor: "pointer", background: esHoy ? "#FFF8F5" : "transparent", transition: "background 0.1s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F8F5F2")}
                      onMouseLeave={e => (e.currentTarget.style.background = esHoy ? "#FFF8F5" : "transparent")}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: esHoy ? 500 : 400, color: esHoy ? "#C97B5A" : pasado ? "#C0BDB8" : "#2C2420", background: esHoy ? "#FAF0E8" : "transparent", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {format(dia, "d")}
                        </span>
                        {clasesD.length > 0 && <span style={{ fontSize: "9px", color: "#C97B5A" }}>{clasesD.length}</span>}
                      </div>
                      {clasesD.slice(0, 3).map(c => (
                        <div key={c.id}
                          onClick={e => { e.stopPropagation(); verDetalle(c.id); }}
                          style={{ fontSize: "10px", padding: "2px 5px", marginBottom: "2px", borderRadius: "3px", background: c.etiqueta ? "#FFF8E8" : "#F0F5E8", color: c.etiqueta ? "#7A6020" : "#3B6D11", borderLeft: `2px solid ${c.tipos_clase?.color ?? "#C97B5A"}`, lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
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
            <div style={{ display: "flex", gap: "16px", marginTop: "10px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "12px", height: "8px", background: "#F0F5E8", border: "0.5px solid #E8E0D8", borderRadius: "2px", display: "inline-block" }} /><span style={{ fontSize: "10px", color: "#9A8880" }}>Clase regular</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "12px", height: "8px", background: "#FFF8E8", border: "0.5px solid #E8E0D8", borderRadius: "2px", display: "inline-block" }} /><span style={{ fontSize: "10px", color: "#9A8880" }}>Con etiqueta</span></div>
              <p style={{ fontSize: "10px", color: "#C0BDB8", marginLeft: "8px" }}>Clic en una clase para ver detalle · clic en día vacío para agregar clase</p>
            </div>
          </>
        ) : (
          <div style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1fr 0.7fr 0.7fr 1fr", gap: "8px", padding: "10px 16px", background: "#F0EDE8", borderBottom: "0.5px solid #E8E0D8", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880" }}>
              <span>Fecha</span><span>Horario</span><span>Clase</span><span>Coach</span><span>Inscritos</span><span>Asistentes</span><span>Etiqueta</span>
            </div>
            {clasesHistorial.length === 0 && <p style={{ padding: "16px", fontSize: "13px", color: "#9A8880" }}>No hay clases pasadas aún.</p>}
            {clasesHistorial.map(c => (
              <div key={c.id} onClick={() => verDetalle(c.id)}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1fr 0.7fr 0.7fr 1fr", gap: "8px", padding: "10px 16px", borderBottom: "0.5px solid #F5F3EF", alignItems: "center", cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F8F5F2")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <p style={{ fontSize: "12px", color: "#2C2420" }}>{format(parseISO(c.fecha), "d MMM yyyy", { locale: es })}</p>
                <p style={{ fontSize: "11px", color: "#9A8880" }}>{c.hora_inicio?.slice(0, 5)} – {c.hora_fin?.slice(0, 5)}</p>
                <p style={{ fontSize: "12px", color: "#2C2420" }}>{c.tipos_clase?.nombre}</p>
                <p style={{ fontSize: "11px", color: "#9A8880" }}>{c.coaches?.nombre} {c.coaches?.apellido}</p>
                <p style={{ fontSize: "12px", color: "#2C2420", textAlign: "center" }}>{c.cupo_maximo - c.cupo_disponible}</p>
                <p style={{ fontSize: "12px", color: "#2C2420", textAlign: "center" }}>{(c as any).asistentes_real ?? "—"}</p>
                {c.etiqueta ? <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", background: "#FFF8E8", color: "#7A6020" }}>{c.etiqueta}</span> : <span style={{ fontSize: "10px", color: "#C0BDB8" }}>—</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel lateral detalle */}
      {(detalle || loadingDetalle) && (
        <div style={{ width: "320px", flexShrink: 0, background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", padding: "1.25rem", alignSelf: "flex-start", position: "sticky", top: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880" }}>Detalle de clase</p>
            <button onClick={() => { setDetalle(null); setEditando(false); }} style={{ fontSize: "18px", color: "#C0BDB8", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>

          {loadingDetalle && <p style={{ fontSize: "13px", color: "#9A8880" }}>Cargando...</p>}

          {detalle && !editando && (
            <>
              <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "0.5px solid #E8E0D8" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ width: "4px", height: "44px", borderRadius: "2px", background: detalle.clase.tipos_clase?.color ?? "#C97B5A", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 400, color: "#2C2420", marginBottom: "2px" }}>{detalle.clase.tipos_clase?.nombre}</p>
                    <p style={{ fontSize: "11px", color: "#9A8880" }}>{format(parseISO(detalle.clase.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })}</p>
                    <p style={{ fontSize: "11px", color: "#9A8880" }}>{detalle.clase.hora_inicio?.slice(0,5)} – {detalle.clase.hora_fin?.slice(0,5)}</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                  <div style={{ background: "#F5F3EF", borderRadius: "6px", padding: "8px 10px" }}>
                    <p style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A8880", marginBottom: "2px" }}>Coach</p>
                    <p style={{ fontSize: "12px", color: "#2C2420" }}>{detalle.clase.coaches?.nombre} {detalle.clase.coaches?.apellido}</p>
                  </div>
                  <div style={{ background: "#F5F3EF", borderRadius: "6px", padding: "8px 10px" }}>
                    <p style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A8880", marginBottom: "2px" }}>Cupos</p>
                    <p style={{ fontSize: "12px", color: detalle.clase.cupo_disponible === 0 ? "#C97B5A" : "#2C2420" }}>
                      {detalle.clase.cupo_disponible} libres / {detalle.clase.cupo_maximo}
                    </p>
                  </div>
                </div>
                {detalle.clase.etiqueta && (
                  <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", background: "#FFF8E8", color: "#7A6020" }}>★ {detalle.clase.etiqueta}</span>
                  </div>
                )}
                {esFutura && (
                  <button onClick={() => setEditando(true)}
                    style={{ width: "100%", padding: "8px", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", border: "0.5px solid #C97B5A", background: "transparent", color: "#C97B5A", borderRadius: "4px", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>
                    Editar clase
                  </button>
                )}
              </div>

              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A8880", marginBottom: "10px" }}>
                  Inscritos ({detalle.reservas.length})
                </p>
                {detalle.reservas.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#C0BDB8" }}>Sin inscritos aún</p>
                ) : (
                  detalle.reservas.map(r => (
                    <div key={r.id} style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "0.5px solid #F0EDE8" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <div>
                          <p style={{ fontSize: "12px", fontWeight: 400, color: "#2C2420" }}>{r.alumnas?.nombre} {r.alumnas?.apellido}</p>
                          <p style={{ fontSize: "10px", color: "#9A8880" }}>{r.alumnas?.telefono}</p>
                        </div>
                        {estadoBadge(r.estado)}
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" as const }}>
                        {["confirmada","asistio","no_asistio","cancelada"].map(est => (
                          <button key={est} onClick={() => actualizarEstado(r.id, est, detalle.clase.id)}
                            style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "20px", border: `0.5px solid ${r.estado === est ? "#C97B5A" : "#E8E0D8"}`, background: r.estado === est ? "#FAF0E8" : "transparent", color: r.estado === est ? "#C97B5A" : "#9A8880", cursor: "pointer", fontFamily: "'Jost',sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                            {est === "confirmada" ? "Confirmada" : est === "asistio" ? "Asistió" : est === "no_asistio" ? "No asistió" : "Cancelar"}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Formulario de edición */}
          {detalle && editando && (
            <>
              <p style={{ fontSize: "12px", color: "#9A8880", marginBottom: "1rem" }}>
                Editando: <span style={{ color: "#2C2420", fontWeight: 400 }}>{detalle.clase.tipos_clase?.nombre}</span>
              </p>

              <div style={{ marginBottom: "12px" }}>
                <label className="ss-label">Tipo de clase</label>
                <select className="ss-input" style={{ cursor: "pointer" }} value={editForm.tipo_clase_id} onChange={e => setEditForm({ ...editForm, tipo_clase_id: e.target.value })}>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label className="ss-label">Coach</label>
                <select className="ss-input" style={{ cursor: "pointer" }} value={editForm.coach_id} onChange={e => setEditForm({ ...editForm, coach_id: e.target.value })}>
                  {coaches.filter(c => c.activa).map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label className="ss-label">Fecha</label>
                <input className="ss-input" type="date" value={editForm.fecha} onChange={e => setEditForm({ ...editForm, fecha: e.target.value })} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label className="ss-label">Hora inicio</label>
                  <input className="ss-input" type="time" value={editForm.hora_inicio} onChange={e => setEditForm({ ...editForm, hora_inicio: e.target.value })} />
                </div>
                <div>
                  <label className="ss-label">Hora fin</label>
                  <input className="ss-input" type="time" value={editForm.hora_fin} onChange={e => setEditForm({ ...editForm, hora_fin: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label className="ss-label">Cupo máximo</label>
                <input className="ss-input" type="number" min="1" max="50" value={editForm.cupo_maximo} onChange={e => setEditForm({ ...editForm, cupo_maximo: e.target.value })} />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label className="ss-label">Etiqueta</label>
                <input className="ss-input" type="text" placeholder="ej: Promoción Abril..." value={editForm.etiqueta} onChange={e => setEditForm({ ...editForm, etiqueta: e.target.value })} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="ss-label">Estado</label>
                <select className="ss-input" style={{ cursor: "pointer" }} value={editForm.estado} onChange={e => setEditForm({ ...editForm, estado: e.target.value })}>
                  <option value="programada">Programada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setEditando(false)} style={{ flex: 1, padding: "10px", border: "0.5px solid #E8E0D8", background: "transparent", color: "#9A8880", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: "4px", fontFamily: "'Jost',sans-serif" }}>
                  Cancelar
                </button>
                <button onClick={guardarEdicion} disabled={savingEdit}
                  style={{ flex: 2, padding: "10px", background: savingEdit ? "#9A8880" : "#2C2420", color: "#FAF8F5", border: "none", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", borderRadius: "4px", fontFamily: "'Jost',sans-serif" }}>
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </>
          )}
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
                <label className="ss-label">Duración</label>
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
              <input className="ss-input" type="text" placeholder="ej: Promoción Abril..." value={form.etiqueta} onChange={e => setForm({ ...form, etiqueta: e.target.value })} />
              <p style={{ fontSize: "10px", color: "#9A8880", marginTop: "4px" }}>Sirve para medir inscripciones por campaña</p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setModal({ open: false })} style={{ flex: 1, padding: "12px", border: "0.5px solid #E8E0D8", background: "transparent", color: "#9A8880", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: "4px", fontFamily: "'Jost',sans-serif" }}>
                Cancelar
              </button>
              <button onClick={guardarClase} disabled={saving}
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
