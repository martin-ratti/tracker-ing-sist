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

export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';

const OFFSET_DIAS: Record<DiaSemana, number> = {
  'Lunes': 0,
  'Martes': 1,
  'Miércoles': 2,
  'Jueves': 3,
  'Viernes': 4,
  'Sábado': 5
};

/**
 * Diccionario de día de la semana asignado para rendir examen final según cada materia.
 * Fuente: Cartilla y cronograma oficial de Mesas y Consultas (UTN FRRo - Dpto. Básicas e ISI).
 */
export const DIAS_MESA_POR_MATERIA: Record<number, DiaSemana> = {
  // --- NIVEL 1 ---
  1: 'Lunes',     // Análisis Matemático I
  2: 'Martes',    // Álgebra y Geometría Analítica
  3: 'Martes',    // Física I
  4: 'Lunes',     // Inglés I
  5: 'Miércoles', // Lógica y Estructuras Discretas
  6: 'Miércoles', // Algoritmos y Estructuras de Datos
  7: 'Lunes',     // Arquitectura de Computadoras
  8: 'Martes',    // Sistemas y Procesos de Negocio

  // --- NIVEL 2 ---
  10: 'Miércoles', // Física II
  11: 'Lunes',     // Ingeniería y Sociedad
  12: 'Miércoles', // Inglés II
  13: 'Jueves',    // Sintaxis y Semántica de los Lenguajes
  14: 'Lunes',     // Paradigmas de Programación
  15: 'Miércoles', // Sistemas Operativos
  16: 'Lunes',     // Análisis de Sistemas de Información

  // --- NIVEL 3 ---
  17: 'Jueves',    // Probabilidad y Estadística
  18: 'Viernes',   // Economía
  19: 'Lunes',     // Base de Datos
  20: 'Miércoles', // Desarrollo de Software
  21: 'Viernes',   // Comunicación de Datos
  22: 'Jueves',    // Análisis Numérico
  23: 'Lunes',     // Diseño de Sistemas de Información

  // --- NIVEL 4 ---
  24: 'Viernes',   // Legislación
  25: 'Viernes',   // Ingeniería y Calidad de Software
  26: 'Viernes',   // Redes de Datos
  27: 'Jueves',    // Investigación Operativa
  28: 'Jueves',    // Simulación
  29: 'Jueves',    // Tecnologías para la Automatización
  30: 'Martes',    // Administración de Sistemas de Información

  // --- NIVEL 5 ---
  31: 'Miércoles', // Inteligencia Artificial
  32: 'Jueves',    // Ciencia de Datos
  33: 'Jueves',    // Sistemas de Gestión
  34: 'Viernes',   // Gestión Gerencial
  35: 'Miércoles', // Seguridad en los Sistemas de Información
  36: 'Lunes',     // Proyecto Final (INT)

  // --- ELECTIVAS ---
  201: 'Miércoles', // Entornos Gráficos / Geográficos
  202: 'Lunes',     // Análisis y Diseño de Datos e Información
  203: 'Jueves',    // Sistemas de Información Geográfica
  205: 'Martes',    // Algoritmos Genéticos
  206: 'Lunes',     // Informática Jurídica
  207: 'Viernes',   // Lenguaje de Programación JAVA
  208: 'Lunes',     // Tecnologías de Desarrollo de Software IDE
  209: 'Lunes',     // Gestión Ingenieril
  210: 'Viernes',   // Introducción a la Práctica Profesional
  211: 'Miércoles', // Química Aplicada a la Informática
  212: 'Miércoles', // Infraestructura Tecnológica
  213: 'Jueves',    // Soporte a la Gestión de Datos con Programación Visual
  214: 'Miércoles', // Metodología de la Investigación
  217: 'Jueves',    // Dirección de Recursos Humanos
  218: 'Lunes'      // Informática en la Administración Pública
};


/**
 * Verifica si una fecha dada en formato YYYY-MM-DD ya finalizó con respecto a hoy.
 */
export function isPastDate(dateStr: string): boolean {
  const target = new Date(dateStr + 'T23:59:59');
  const now = new Date();
  return target < now;
}

/**
 * Calcula la fecha exacta de examen para una materia específica dentro de un turno de examen.
 * Si la materia tiene un día de mesa asignado, calcula la fecha exacta sumando el desplazamiento al lunes de inicio.
 */
export function getFechaExactaMesa(materiaId: number, turno: TurnoExamenOficial): { fechaExactaStr: string; diaNombre: DiaSemana } | null {
  const diaAsignado = DIAS_MESA_POR_MATERIA[materiaId];
  if (!diaAsignado) return null;

  const offset = OFFSET_DIAS[diaAsignado] ?? 0;
  const fechaBase = new Date(turno.fechaInicio + 'T00:00:00');
  fechaBase.setDate(fechaBase.getDate() + offset);

  const year = fechaBase.getFullYear();
  const month = String(fechaBase.getMonth() + 1).padStart(2, '0');
  const day = String(fechaBase.getDate()).padStart(2, '0');
  const fechaExactaStr = `${year}-${month}-${day}`;

  return {
    fechaExactaStr,
    diaNombre: diaAsignado
  };
}

