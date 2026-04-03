export type Estudio = "Barre" | "Pilates" | "Yoga";

export interface Alumna {
  id: string;
  created_at: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  estudio: Estudio;
  nivel: Nivel;
  como_nos_conocio: string;
  observaciones_medicas: string | null;
  activa: boolean;
  tipo_alumna: "regular" | "prueba" | "inactiva";
  notas_internas: string | null;
  auth_user_id: string | null;
}

export interface Plan {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: "mensual" | "trimestral" | "pack" | "prueba" | "anual";
  precio: number;
  duracion_dias: number | null;
  clases_incluidas: number | null;
  estudio: Estudio;
  activo: boolean;
}

export interface Coach {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  especialidad: string[];
  bio: string | null;
  foto_url: string | null;
  activa: boolean;
}

export interface TipoClase {
  id: string;
  nombre: string;
  estudio: Estudio;
  duracion_min: number;
  descripcion: string | null;
  color: string;
}

export interface Clase {
  id: string;
  tipo_clase_id: string;
  coach_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cupo_maximo: number;
  cupo_disponible: number;
  estado: "programada" | "en_curso" | "finalizada" | "cancelada";
  notas: string | null;
  etiqueta: string | null;
  es_recurrente: boolean;
  asistentes_real: number | null;
  tipos_clase?: TipoClase;
  coaches?: Coach;
}

export interface Inscripcion {
  id: string;
  alumna_id: string;
  plan_id: string;
  fecha_inicio: string;
  fecha_vencimiento: string | null;
  clases_restantes: number | null;
  clases_usadas: number;
  estado: "activa" | "vencida" | "cancelada" | "pendiente_pago";
  monto_pagado: number | null;
  metodo_pago: string | null;
  planes?: Plan;
}

export interface Reserva {
  id: string;
  alumna_id: string;
  clase_id: string;
  estado: "confirmada" | "cancelada" | "asistio" | "no_asistio" | "lista_espera";
  clases?: Clase;
}
