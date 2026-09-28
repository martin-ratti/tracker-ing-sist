export interface TurnoExamenOficial {
  id: string;
  nombre: string;
  nombreCorto: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  mes: string;
  anio: number;
  llamado: number | 'especial';
  esEspecial?: boolean;
  descripcion?: string;
  diasEspecificos?: string[]; // Para turnos con fechas no contiguas (ej. Abril, Mayo, Agosto, Sep)
}

export interface HitoAcademico {
  id: string;
  titulo: string;
  fechaInicio: string;
  fechaFin?: string;
  tipo: 'inscripcion' | 'cuatrimestre' | 'receso' | 'feriado';
  detalle: string;
}

export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
