export type EstadoMateria = 'pendiente' | 'regular' | 'aprobada';

export interface Materia {
  id: number;
  nombre: string;
  nombreCompleto: string;
  nivel: number;
  horas: number;
  esIntegradora?: boolean;
  esCuatrimestral?: boolean;
  esAdusiSolo?: boolean;
  reqRegular: number[];
  reqAprobada: number[] | 'TODAS';
  reqRendirAprobada?: number[] | 'TODAS';
}

export interface Electiva {
  id: number;
  nombre: string;
  nivel: number;
  horas: number;
  tipo: 'Cuatrimestral' | 'Anual';
  cuatrimestre: string;
  reqRegular: number[];
  reqAprobada: number[];
}

export interface NotaMateria {
  nota?: number;
}

export interface PerfilAlumno {
  nombre: string;
  legajo: string;
}

export interface MetaExamen {
  materiaId: number;
  turnoId: string;
  turnoNombre: string;
  fechaEstimada?: string;
  llamado?: number;
  comentario?: string;
  notificado7Dias?: boolean;
}

export interface MetaGlobalizador {
  materiaId: number;
  fecha: string;
  comentario?: string;
  notificado7Dias?: boolean;
}

export interface ProgresoUsuario {
  estados: Record<number, EstadoMateria>;
  estadosElectivas: Record<number, EstadoMateria>;
  notas: Record<number, NotaMateria>;
  ppsHoras: number;
  perfil?: PerfilAlumno;
  metasExamen?: Record<number, MetaExamen>;
  metasGlobalizador?: Record<number, MetaGlobalizador>;
  actualizadoEn?: string;
}

export interface PlanData {
  carrera: string;
  facultad: string;
  plan: string;
  materiasTroncales: Materia[];
  materiasElectivas: Electiva[];
}
