export type EstadoMateria = 'pendiente' | 'regular' | 'aprobada';

export interface Materia {
  id: number;
  nombre: number | string;
  nombreCompleto?: string;
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
  fecha?: string;
  libro?: string;
  folio?: string;
  comentario?: string;
}

export interface ProgresoUsuario {
  estados: Record<number, EstadoMateria>;
  estadosElectivas: Record<number, EstadoMateria>;
  notas: Record<number, NotaMateria>;
  ppsHoras: number;
  actualizadoEn?: string;
}
