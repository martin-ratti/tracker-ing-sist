import type { HitoAcademico } from './types';

/**
 * Genera los feriados nacionales inamovibles y los asuetos de la UTN FRRo
 * que se repiten con fecha fija todos los años.
 */
export function generarFeriadosFijos(anio: number): HitoAcademico[] {
  return [
    {
      id: `memoria-${anio}`,
      titulo: 'Día Nacional de la Memoria por la Verdad y la Justicia',
      fechaInicio: `${anio}-03-24`,
      tipo: 'feriado',
      detalle: 'Feriado nacional en conmemoración del Día Nacional de la Memoria por la Verdad y la Justicia.'
    },
    {
      id: `malvinas-${anio}`,
      titulo: 'Día del Veterano y los Caídos en la Guerra de Malvinas',
      fechaInicio: `${anio}-04-02`,
      tipo: 'feriado',
      detalle: 'Feriado nacional en homenaje a los veteranos y caídos en Malvinas.'
    },
    {
      id: `trabajador-${anio}`,
      titulo: 'Día del Trabajador',
      fechaInicio: `${anio}-05-01`,
      tipo: 'feriado',
      detalle: 'Feriado nacional por el Día Internacional de los Trabajadores.'
    },
    {
      id: `docente-tecnologico-${anio}`,
      titulo: 'Día del Docente Tecnológico',
      fechaInicio: `${anio}-05-02`,
      tipo: 'feriado',
      detalle: 'Día del Docente de la Universidad Tecnológica Nacional. Sin actividad académica.'
    },
    {
      id: `rev-mayo-${anio}`,
      titulo: 'Aniversario de la Revolución de Mayo',
      fechaInicio: `${anio}-05-25`,
      tipo: 'feriado',
      detalle: 'Feriado nacional en conmemoración del aniversario de la Revolución de Mayo.'
    },
    {
      id: `belgrano-${anio}`,
      titulo: 'Paso a la Inmortalidad del General Manuel Belgrano',
      fechaInicio: `${anio}-06-20`,
      tipo: 'feriado',
      detalle: 'Feriado nacional y Día de la Bandera.'
    },
    {
      id: `trabajador-estado-${anio}`,
      titulo: 'Día del Trabajador del Estado',
      fechaInicio: `${anio}-06-27`,
      tipo: 'feriado',
      detalle: 'Día del Trabajador del Estado. Sin actividad.'
    },
    {
      id: `independencia-${anio}`,
      titulo: 'Día de la Independencia',
      fechaInicio: `${anio}-07-09`,
      tipo: 'feriado',
      detalle: 'Feriado nacional por el Día de la Independencia.'
    },
    {
      id: `fundacion-uon-${anio}`,
      titulo: 'Aniversario de la Fundación de la UON',
      fechaInicio: `${anio}-08-19`,
      tipo: 'feriado',
      detalle: 'Aniversario de la creación de la Universidad Obrera Nacional (actual UTN). Sin actividad en el ámbito universitario.'
    },
    {
      id: `estudiante-${anio}`,
      titulo: 'Día del Estudiante',
      fechaInicio: `${anio}-09-21`,
      tipo: 'feriado',
      detalle: 'Día del Estudiante. Sin actividad académica.'
    },
    {
      id: `virgen-rosario-${anio}`,
      titulo: 'Día de la Virgen de Rosario',
      fechaInicio: `${anio}-10-07`,
      tipo: 'feriado',
      detalle: 'Festividad de la Virgen del Rosario, patrona de la ciudad de Rosario. Sin actividad académica ni administrativa en UTN FRRo.'
    },
    {
      id: `no-docente-${anio}`,
      titulo: 'Día del No Docente',
      fechaInicio: `${anio}-11-26`,
      tipo: 'feriado',
      detalle: 'Día de los trabajadores no docentes de las Universidades Nacionales. Sin actividad en la facultad.'
    },
    {
      id: `inmaculada-${anio}`,
      titulo: 'Inmaculada Concepción de María',
      fechaInicio: `${anio}-12-08`,
      tipo: 'feriado',
      detalle: 'Feriado nacional.'
    },
    {
      id: `navidad-${anio}`,
      titulo: 'Navidad',
      fechaInicio: `${anio}-12-25`,
      tipo: 'feriado',
      detalle: 'Feriado nacional de Navidad.'
    }
  ];
}
