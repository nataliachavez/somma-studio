"use client";
import { useEffect, useState, useRef } from "react";
import { Coach } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function CoachesPage() {
  const [coaches, setCoaches]   = useState<Coach[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", telefono: "",
    especialidad: [] as string[], bio: "", foto_url: "",
    dni: "", direccion: "", fecha_nacimiento: "", notas_internas: "",
  });

  const cargar = () => {
    fetch("/api/admin/coaches").then(r => r.json()).then(d => {
      setCoaches(d.coaches ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { cargar(); }, []);

  const subirFoto = async (file: File) => {
    setUploadingFoto(true);
    const ext      = file.name.split(".").pop();
    const filename = `coach-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("coaches").upload(filename, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("coaches").getPublicUrl(filename);
      setForm(f => ({ ...f, foto_url: publicUrl }));
    }
    setUploadingFoto(false);
  };

  const toggleEspecialidad = (esp: string) => {
    setForm(f => ({
      ...f,
      especialidad: f.especialidad.includes(esp)
        ? f.especialidad.filter(e => e !== esp)
        : [...f.especialidad, esp],
    }));
  };

  const guardar = async () => {
    setSaving(true);
    await fetch("/api/admin/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModal(false);
    setForm({ nombre: "", apellido: "", email: "", telefono: "", especialidad: [], bio: "", foto_url: "", dni: "", direccion: "", fecha_nacimiento: "", notas_internas: "" });
    cargar();
    setSaving(false);
  };

  const ESPECIALIDADES = ["Barre", "Pilates", "Yoga", "Pilates Reformer", "Yoga Restaurativo"];
  const initiales = (n: string, a: string) => `${n[0] ?? ""}${a[0] ?? ""}`.toUpperCase();
  const bgColors  = ["#FAF0E8","#E8EFF5","#EAF3DE","#EEE8F2"];
  const txtColors = ["#854F0B","#185FA5","#3B6D11","#534AB7"];

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 400, fontSize: "24px", color: "#2C2420" }}>
          Coaches <span style={{ fontStyle: "italic", color: "#C97B5A" }}>del estudio</span>
        </h1>
        <button onClick={() => setModal(true)} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 16px", background: "#2C2420", color: "#FAF8F5", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>
          + Nueva coach
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
        {loading && <p style={{ fontSize: "13px", color: "#9A8880" }}>Cargando...</p>}
        {!loading && coaches.length === 0 && <p style={{ fontSize: "13px", color: "#9A8880" }}>No hay coaches registradas aún.</p>}
        {!loading && coaches.map((c, i) => (
          <div key={c.id} style={{ background: "#FAF8F5", border: "0.5px solid #E8E0D8", borderRadius: "10px", overflow: "hidden" }}>
            {/* Foto o iniciales */}
            <div style={{ height: "140px", background: c.foto_url ? "transparent" : bgColors[i % bgColors.length], display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {c.foto_url
                ? <img src={c.foto_url} alt={c.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "36px", fontWeight: 500, color: txtColors[i % txtColors.length] }}>{initiales(c.nombre, c.apellido)}</span>}
            </div>
            <div style={{ padding: "1rem" }}>
              <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: "16px", fontWeight: 400, color: "#2C2420", marginBottom: "2px" }}>{c.nombre} {c.apellido}</p>
              {c.bio && <p style={{ fontSize: "12px", color: "#9A8880", lineHeight: 1.6, marginBottom: "10px" }}>{c.bio}</p>}
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px", marginBottom: "8px" }}>
                {c.especialidad?.map(e => (
                  <span key={e} style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "20px", background: "#F0EBE1", color: "#7A6140", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{e}</span>
                ))}
              </div>
              {/* Info interna (solo vista admin) */}
              <div style={{ borderTop: "0.5px solid #F0EDE8", paddingTop: "8px", marginTop: "4px" }}>
                <p style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#C0BDB8", marginBottom: "4px" }}>Info interna</p>
                <p style={{ fontSize: "11px", color: "#9A8880" }}>{c.email}</p>
                {c.telefono && <p style={{ fontSize: "11px", color: "#9A8880" }}>{c.telefono}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal nueva coach */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#FAF8F5", borderRadius: "12px", padding: "2rem", width: "520px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontFamily: "'Libre Baskerville',serif", fontWeight: 400, fontSize: "20px", color: "#2C2420", marginBottom: "1.5rem" }}>Nueva coach</h2>

            {/* Foto */}
            <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, border: "0.5px solid #E8E0D8" }}>
                {form.foto_url
                  ? <img src={form.foto_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "24px", color: "#C0BDB8" }}>+</span>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && subirFoto(e.target.files[0])} />
                <button onClick={() => fileRef.current?.click()} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 14px", border: "0.5px solid #E8E0D8", background: "transparent", color: "#9A8880", cursor: "pointer", borderRadius: "4px", fontFamily: "'Jost',sans-serif" }}>
                  {uploadingFoto ? "Subiendo..." : "Subir foto"}
                </button>
                <p style={{ fontSize: "10px", color: "#C0BDB8", marginTop: "4px" }}>JPG o PNG · máx 5MB</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div><label className="ss-label">Nombre *</label><input className="ss-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
              <div><label className="ss-label">Apellido *</label><input className="ss-input" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} /></div>
            </div>
            <div style={{ marginBottom: "12px" }}><label className="ss-label">Email *</label><input className="ss-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div><label className="ss-label">Teléfono</label><input className="ss-input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
              <div><label className="ss-label">Fecha nacimiento</label><input className="ss-input" type="date" value={form.fecha_nacimiento} onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} /></div>
            </div>
            <div style={{ marginBottom: "12px" }}><label className="ss-label">DNI</label><input className="ss-input" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} /></div>
            <div style={{ marginBottom: "12px" }}><label className="ss-label">Dirección</label><input className="ss-input" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>

            <div style={{ marginBottom: "12px" }}>
              <label className="ss-label">Especialidades</label>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px", marginTop: "6px" }}>
                {ESPECIALIDADES.map(e => (
                  <button key={e} onClick={() => toggleEspecialidad(e)} style={{ fontSize: "10px", padding: "5px 12px", borderRadius: "20px", border: `0.5px solid ${form.especialidad.includes(e) ? "#C97B5A" : "#E8E0D8"}`, background: form.especialidad.includes(e) ? "#FAF0E8" : "transparent", color: form.especialidad.includes(e) ? "#C97B5A" : "#9A8880", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label className="ss-label">Bio (visible para alumnas)</label>
              <textarea className="ss-input" rows={2} style={{ resize: "none" }} placeholder="Breve descripción de experiencia..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="ss-label">Notas internas</label>
              <textarea className="ss-input" rows={2} style={{ resize: "none" }} placeholder="Solo visible para el equipo..." value={form.notas_internas} onChange={e => setForm({ ...form, notas_internas: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: "12px", border: "0.5px solid #E8E0D8", background: "transparent", color: "#9A8880", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: "4px", fontFamily: "'Jost',sans-serif" }}>Cancelar</button>
              <button onClick={guardar} disabled={saving || !form.nombre || !form.email} style={{ flex: 2, padding: "12px", background: saving ? "#9A8880" : "#2C2420", color: "#FAF8F5", border: "none", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", borderRadius: "4px", fontFamily: "'Jost',sans-serif" }}>
                {saving ? "Guardando..." : "Guardar coach"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
