import type { TurnoExamenOficial, HitoAcademico } from '../types';

export const TURNOS_2026: TurnoExamenOficial[] = [
  // Verano 2026
  {
    id: 'feb-2026-l1',
    nombre: 'Turno Febrero 2026 (Llamado 1)',
    nombreCorto: 'Feb Llamado 1',
    fechaInicio: '2026-02-09',
    fechaFin: '2026-02-13',
    mes: 'Febrero',
    anio: 2026,
    llamado: 1
  },
  {
    id: 'feb-2026-l2',
    nombre: 'Turno Febrero 2026 (Llamado 2)',
    nombreCorto: 'Feb Llamado 2',
    fechaInicio: '2026-02-23',
    fechaFin: '2026-02-27',
    mes: 'Febrero',
    anio: 2026,
    llamado: 2
  },
  {
    id: 'mar-2026-l3',
    nombre: 'Turno Marzo 2026 (Llamado 3)',
    nombreCorto: 'Marzo Llamado 3',
    fechaInicio: '2026-03-09',
    fechaFin: '2026-03-13',
    mes: 'Marzo',
    anio: 2026,
    llamado: 3,
    descripcion: 'Último llamado turno verano previo al inicio de clases'
  },

  // Mesas del 1° Cuatrimestre
  {
    id: 'abr-2026',
    nombre: 'Turno Abril 2026',
    nombreCorto: 'Turno Abril',
    fechaInicio: '2026-04-09',
    fechaFin: '2026-04-27',
    diasEspecificos: ['2026-04-09', '2026-04-10', '2026-04-15', '2026-04-21', '2026-04-27'],
    mes: 'Abril',
    anio: 2026,
    llamado: 1,
    descripcion: 'Mesas distribuidas: Jue 9, Vie 10, Mié 15, Mar 21 y Lun 27 de abril'
  },
  {
    id: 'may-2026',
    nombre: 'Turno Mayo 2026',
    nombreCorto: 'Turno Mayo',
    fechaInicio: '2026-05-07',
    fechaFin: '2026-05-19',
    diasEspecificos: ['2026-05-07', '2026-05-08', '2026-05-13', '2026-05-18', '2026-05-19'],
    mes: 'Mayo',
    anio: 2026,
    llamado: 1,
    descripcion: 'Mesas distribuidas: Jue 7, Vie 8, Mié 13, Lun 18 y Mar 19 de mayo'
  },
  {
    id: 'jun-2026-especial',
    nombre: 'Mesa Especial de Junio 2026',
    nombreCorto: 'Mesa Especial Junio',
    fechaInicio: '2026-06-22',
    fechaFin: '2026-06-26',
    mes: 'Junio',
    anio: 2026,
    llamado: 'especial',
    esEspecial: true,
    descripcion: 'Mesa especial de exámenes (22 al 26 de junio)'
  },

  // Mesas del 2° Cuatrimestre (En julio no hay mesas comunes)
  {
    id: 'ago-2026',
    nombre: 'Turno Agosto 2026',
    nombreCorto: 'Turno Agosto',
    fechaInicio: '2026-08-07',
    fechaFin: '2026-08-31',
    diasEspecificos: ['2026-08-07', '2026-08-13', '2026-08-25', '2026-08-26', '2026-08-31'],
    mes: 'Agosto',
    anio: 2026,
    llamado: 1,
    descripcion: 'Mesas distribuidas: Vie 7, Jue 13, Mar 25, Mié 26 y Lun 31 de agosto'
  },
  {
    id: 'sep-2026',
    nombre: 'Turno Septiembre 2026',
    nombreCorto: 'Turno Septiembre',
    fechaInicio: '2026-09-04',
    fechaFin: '2026-09-28',
    diasEspecificos: ['2026-09-04', '2026-09-10', '2026-09-16', '2026-09-22', '2026-09-28'],
    mes: 'Septiembre',
    anio: 2026,
    llamado: 1,
    descripcion: 'Mesas distribuidas: Vie 4, Jue 10, Mié 16, Mar 22 y Lun 28 de septiembre'
  },
  {
    id: 'oct-2026-especial',
    nombre: 'Mesa Especial de Octubre 2026',
    nombreCorto: 'Mesa Especial Octubre',
    fechaInicio: '2026-10-26',
    fechaFin: '2026-10-30',
    mes: 'Octubre',
    anio: 2026,
    llamado: 'especial',
    esEspecial: true,
    descripcion: 'Mesa especial de exámenes (26 al 30 de octubre)'
  },

  // Turno Fin de Año 2026
  {
    id: 'nov-2026-l1',
    nombre: 'Turno Noviembre 2026 (Llamado 1)',
    nombreCorto: 'Noviembre Llamado 1',
    fechaInicio: '2026-11-16',
    fechaFin: '2026-11-20',
    mes: 'Noviembre',
    anio: 2026,
    llamado: 1
  },
  {
    id: 'nov-dic-2026-l2',
    nombre: 'Turno Noviembre / Diciembre 2026 (Llamado 2)',
    nombreCorto: 'Nov/Dic Llamado 2',
    fechaInicio: '2026-11-30',
    fechaFin: '2026-12-04',
    mes: 'Diciembre',
    anio: 2026,
    llamado: 2
  },
  {
    id: 'dic-2026-l3',
    nombre: 'Turno Diciembre 2026 (Llamado 3)',
    nombreCorto: 'Diciembre Llamado 3',
    fechaInicio: '2026-12-14',
    fechaFin: '2026-12-18',
    mes: 'Diciembre',
    anio: 2026,
    llamado: 3
  }
];

export const HITOS_ACADEMICOS_2026_BASE: HitoAcademico[] = [
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
    detalle: 'Cierre del cursado de materias del primer cuatrimestre.'
  },
  {
    id: 'receso-invernal-2026',
    titulo: 'Vacaciones de Invierno (Receso Invernal)',
    fechaInicio: '2026-07-06',
    fechaFin: '2026-07-19',
    tipo: 'receso',
    detalle: 'Sin actividad académica presencial.'
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

export const FERIADOS_MOVILES_2026: HitoAcademico[] = [
  {
    id: 'carnaval-2026',
    titulo: 'Carnaval',
    fechaInicio: '2026-02-16',
    fechaFin: '2026-02-17',
    tipo: 'feriado',
    detalle: 'Feriado nacional de Carnaval (lunes y martes). Sin actividad académica ni administrativa.'
  },
  {
    id: 'feriado-turistico-mar-2026',
    titulo: 'Feriado Turístico',
    fechaInicio: '2026-03-23',
    tipo: 'feriado',
    detalle: 'Feriado puente turístico. Sin actividad.'
  },
  {
    id: 'viernes-santo-2026',
    titulo: 'Viernes Santo',
    fechaInicio: '2026-04-03',
    tipo: 'feriado',
    detalle: 'Feriado nacional por festividad religiosa.'
  },
  {
    id: 'guemes-2026',
    titulo: 'Paso a la Inmortalidad del General Güemes',
    fechaInicio: '2026-06-15',
    tipo: 'feriado',
    detalle: 'Feriado nacional trasladado.'
  },
  {
    id: 'feriado-turistico-jul-2026',
    titulo: 'Feriado Turístico',
    fechaInicio: '2026-07-10',
    tipo: 'feriado',
    detalle: 'Feriado puente turístico. Sin actividad.'
  },
  {
    id: 'san-martin-2026',
    titulo: 'Paso a la Inmortalidad del General San Martín',
    fechaInicio: '2026-08-17',
    tipo: 'feriado',
    detalle: 'Feriado nacional trasladado.'
  },
  {
    id: 'diversidad-2026',
    titulo: 'Día del Respeto a la Diversidad Cultural',
    fechaInicio: '2026-10-12',
    tipo: 'feriado',
    detalle: 'Feriado nacional.'
  },
  {
    id: 'soberania-2026',
    titulo: 'Día de la Soberanía Nacional',
    fechaInicio: '2026-11-23',
    tipo: 'feriado',
    detalle: 'Feriado nacional trasladado del 20 de noviembre.'
  },
  {
    id: 'feriado-turistico-dic-2026',
    titulo: 'Feriado Turístico',
    fechaInicio: '2026-12-07',
    tipo: 'feriado',
    detalle: 'Feriado puente turístico. Sin actividad.'
  }
];

export const CALENDARIO_2026 = {
  anio: 2026,
  turnos: TURNOS_2026,
  hitosBase: HITOS_ACADEMICOS_2026_BASE,
  feriadosMoviles: FERIADOS_MOVILES_2026
};
