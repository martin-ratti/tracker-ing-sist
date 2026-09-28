import type { TurnoExamenOficial, HitoAcademico } from '../types';

export const TURNOS_2027: TurnoExamenOficial[] = [
  // Verano 2027
  {
    id: 'feb-2027-l1',
    nombre: 'Turno Febrero 2027 (Llamado 1)',
    nombreCorto: 'Feb 2027 Llamado 1',
    fechaInicio: '2027-02-10',
    fechaFin: '2027-02-12',
    diasEspecificos: ['2027-02-10', '2027-02-11', '2027-02-12'],
    mes: 'Febrero',
    anio: 2027,
    llamado: 1,
    descripcion: 'Turno de 3 días hábiles post Carnaval'
  },
  {
    id: 'feb-2027-l2',
    nombre: 'Turno Febrero 2027 (Llamado 2)',
    nombreCorto: 'Feb 2027 Llamado 2',
    fechaInicio: '2027-02-22',
    fechaFin: '2027-02-26',
    mes: 'Febrero',
    anio: 2027,
    llamado: 2
  },
  {
    id: 'mar-2027-l3',
    nombre: 'Turno Marzo 2027 (Llamado 3)',
    nombreCorto: 'Marzo 2027 Llamado 3',
    fechaInicio: '2027-03-08',
    fechaFin: '2027-03-12',
    mes: 'Marzo',
    anio: 2027,
    llamado: 3
  }
];

export const HITOS_ACADEMICOS_2027_BASE: HitoAcademico[] = [
  {
    id: 'inicio-1c-2027',
    titulo: 'Inicio del 1º Cuatrimestre 2027',
    fechaInicio: '2027-03-15',
    tipo: 'cuatrimestre',
    detalle: 'Comienzo de clases del ciclo lectivo 2027.'
  }
];

export const FERIADOS_MOVILES_2027: HitoAcademico[] = [
  {
    id: 'carnaval-2027',
    titulo: 'Carnaval',
    fechaInicio: '2027-02-08',
    fechaFin: '2027-02-09',
    tipo: 'feriado',
    detalle: 'Feriado nacional de Carnaval (lunes 8 y martes 9 de febrero de 2027). Sin actividad.'
  }
];

export const CALENDARIO_2027 = {
  anio: 2027,
  turnos: TURNOS_2027,
  hitosBase: HITOS_ACADEMICOS_2027_BASE,
  feriadosMoviles: FERIADOS_MOVILES_2027
};
