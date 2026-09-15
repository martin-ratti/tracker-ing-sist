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
}

export interface HitoAcademico {
  id: string;
  titulo: string;
  fechaInicio: string;
  fechaFin?: string;
  tipo: 'inscripcion' | 'cuatrimestre' | 'receso' | 'feriado';
  detalle: string;
}

export const TURNOS_EXAMEN_2026: TurnoExamenOficial[] = [
  // Verano 2026
  {
    id: 'feb-2026-l1',
    nombre: 'Turno Febrero 2026 (Llamado 1)',
    nombreCorto: 'Feb Llamado 1',
    fechaInicio: '2026-02-09',
    fechaFin: '2026-02-14',
    mes: 'Febrero',
    anio: 2026,
    llamado: 1
  },
  {
    id: 'feb-2026-l2',
    nombre: 'Turno Febrero 2026 (Llamado 2)',
    nombreCorto: 'Feb Llamado 2',
    fechaInicio: '2026-02-23',
    fechaFin: '2026-02-28',
    mes: 'Febrero',
    anio: 2026,
    llamado: 2
  },
  {
    id: 'mar-2026-l3',
    nombre: 'Turno Marzo 2026 (Llamado 3)',
    nombreCorto: 'Marzo Llamado 3',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-03-07',
    mes: 'Marzo',
    anio: 2026,
    llamado: 3,
    descripcion: 'Último llamado turno verano previo al inicio de clases'
  },

  // Mesas del 1° Cuatrimestre
  {
    id: 'abr-2026-especial',
    nombre: 'Mesa Especial de Abril 2026',
    nombreCorto: 'Mesa Especial Abril',
    fechaInicio: '2026-04-20',
    fechaFin: '2026-04-25',
    mes: 'Abril',
    anio: 2026,
    llamado: 'especial',
    esEspecial: true,
    descripcion: 'Inscripción presencial en Legajos y Actas'
  },
  {
    id: 'may-2026',
    nombre: 'Turno Mayo 2026',
    nombreCorto: 'Turno Mayo',
    fechaInicio: '2026-05-18',
    fechaFin: '2026-05-23',
    mes: 'Mayo',
    anio: 2026,
    llamado: 1
  },

  // Turno Invierno 2026
  {
    id: 'jul-2026-l1',
    nombre: 'Turno Julio 2026 (Llamado 1)',
    nombreCorto: 'Julio Llamado 1',
    fechaInicio: '2026-07-27',
    fechaFin: '2026-08-01',
    mes: 'Julio',
    anio: 2026,
    llamado: 1
  },
  {
    id: 'ago-2026-l2',
    nombre: 'Turno Agosto 2026 (Llamado 2)',
    nombreCorto: 'Agosto Llamado 2',
    fechaInicio: '2026-08-10',
    fechaFin: '2026-08-15',
    mes: 'Agosto',
    anio: 2026,
    llamado: 2
  },
  {
    id: 'ago-2026-l3',
    nombre: 'Turno Agosto 2026 (Llamado 3)',
    nombreCorto: 'Agosto Llamado 3',
    fechaInicio: '2026-08-24',
    fechaFin: '2026-08-29',
    mes: 'Agosto',
    anio: 2026,
    llamado: 3
  },

  // Mesas del 2° Cuatrimestre
  {
    id: 'sep-2026',
    nombre: 'Turno Septiembre 2026',
    nombreCorto: 'Turno Septiembre',
    fechaInicio: '2026-08-31',
    fechaFin: '2026-09-05',
    mes: 'Septiembre',
    anio: 2026,
    llamado: 1
  },
  {
    id: 'sep-2026-especial',
    nombre: 'Mesa Especial de Septiembre 2026',
    nombreCorto: 'Mesa Especial Septiembre',
    fechaInicio: '2026-09-14',
    fechaFin: '2026-09-19',
    mes: 'Septiembre',
    anio: 2026,
    llamado: 'especial',
    esEspecial: true,
    descripcion: 'Inscripción presencial en Legajos y Actas'
  },

  // Turno Fin de Año 2026
  {
    id: 'nov-2026-l1',
    nombre: 'Turno Noviembre 2026 (Llamado 1)',
    nombreCorto: 'Noviembre Llamado 1',
    fechaInicio: '2026-11-16',
    fechaFin: '2026-11-21',
    mes: 'Noviembre',
    anio: 2026,
    llamado: 1
  },
  {
    id: 'nov-dic-2026-l2',
    nombre: 'Turno Noviembre / Diciembre 2026 (Llamado 2)',
    nombreCorto: 'Nov/Dic Llamado 2',
    fechaInicio: '2026-11-30',
    fechaFin: '2026-12-05',
    mes: 'Diciembre',
    anio: 2026,
    llamado: 2
  },
  {
    id: 'dic-2026-l3',
    nombre: 'Turno Diciembre 2026 (Llamado 3)',
    nombreCorto: 'Diciembre Llamado 3',
    fechaInicio: '2026-12-14',
    fechaFin: '2026-12-19',
    mes: 'Diciembre',
    anio: 2026,
    llamado: 3
  },

  // Verano 2027
  {
    id: 'feb-2027-l1',
    nombre: 'Turno Febrero 2027 (Llamado 1)',
    nombreCorto: 'Feb 2027 Llamado 1',
    fechaInicio: '2027-02-15',
    fechaFin: '2027-02-20',
    mes: 'Febrero',
    anio: 2027,
    llamado: 1
  },
  {
    id: 'feb-2027-l2',
    nombre: 'Turno Febrero 2027 (Llamado 2)',
    nombreCorto: 'Feb 2027 Llamado 2',
    fechaInicio: '2027-02-22',
    fechaFin: '2027-02-27',
    mes: 'Febrero',
    anio: 2027,
    llamado: 2
  },
  {
    id: 'mar-2027-l3',
    nombre: 'Turno Marzo 2027 (Llamado 3)',
    nombreCorto: 'Marzo 2027 Llamado 3',
    fechaInicio: '2027-03-08',
    fechaFin: '2027-03-13',
    mes: 'Marzo',
    anio: 2027,
    llamado: 3
  }
];

export const HITOS_ACADEMICOS_2026: HitoAcademico[] = [
  {
    id: 'insc-1c-2026',
    titulo: 'Inscripción a materias Anuales y 1º Cuatrimestre',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-03-16',
    tipo: 'inscripcion',
    detalle: 'Del 2 al 16 de marzo de 2026 a través de Sysacad.'
  },
  {
    id: 'inicio-1c-2026',
    titulo: 'Inicio del 1º Cuatrimestre',
    fechaInicio: '2026-03-16',
    tipo: 'cuatrimestre',
    detalle: 'Comienzo formal del dictado de clases del ciclo lectivo 2026.'
  },
  {
    id: 'fin-1c-2026',
    titulo: 'Fin del 1º Cuatrimestre',
    fechaInicio: '2026-07-03',
    tipo: 'cuatrimestre',
    detalle: 'Cierre del cursado de materias del primer semestre.'
  },
  {
    id: 'receso-invernal-2026',
    titulo: 'Receso Invernal (Vacaciones de Invierno)',
    fechaInicio: '2026-07-06',
    fechaFin: '2026-07-19',
    tipo: 'receso',
    detalle: 'Sin actividad académica presencial ni administrativa.'
  },
  {
    id: 'insc-2c-2026',
    titulo: 'Inscripción a materias del 2º Cuatrimestre',
    fechaInicio: '2026-07-06',
    fechaFin: '2026-07-20',
    tipo: 'inscripcion',
    detalle: 'Del 6 al 20 de julio de 2026 en Sysacad.'
  },
  {
    id: 'inicio-2c-2026',
    titulo: 'Inicio del 2º Cuatrimestre',
    fechaInicio: '2026-07-20',
    tipo: 'cuatrimestre',
    detalle: 'Inicio de clases del segundo semestre lectivo.'
  },
  {
    id: 'fin-2c-2026',
    titulo: 'Fin del 2º Cuatrimestre',
    fechaInicio: '2026-11-13',
    tipo: 'cuatrimestre',
    detalle: 'Cierre del ciclo lectivo regular 2026.'
  }
];

export const REGLA_SYSACAD_EXAMEN = {
  descripcion: 'Una vez habilitado en Sysacad, la inscripción a examen permanecerá abierta hasta las 18:00 hs del penúltimo día hábil previo a la fecha de la mesa.'
};
