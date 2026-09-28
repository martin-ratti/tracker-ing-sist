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

/**
 * Determina si una fecha específica (YYYY-MM-DD) forma parte activa del turno de examen.
 */
export function isFechaEnTurno(fechaStr: string, turno: TurnoExamenOficial): boolean {
  if (turno.diasEspecificos && turno.diasEspecificos.length > 0) {
    return turno.diasEspecificos.includes(fechaStr);
  }
  return fechaStr >= turno.fechaInicio && fechaStr <= turno.fechaFin;
}

export const TURNOS_EXAMEN_2026: TurnoExamenOficial[] = [
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
  },

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

export const HITOS_ACADEMICOS_2026: HitoAcademico[] = [
  // Hitos académicos
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
  },
  {
    id: 'inicio-1c-2027',
    titulo: 'Inicio del 1º Cuatrimestre 2027',
    fechaInicio: '2027-03-15',
    tipo: 'cuatrimestre',
    detalle: 'Comienzo de clases del ciclo lectivo 2027.'
  },

  // Feriados y días sin actividad 2026
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
    id: 'memoria-2026',
    titulo: 'Día Nacional de la Memoria por la Verdad y la Justicia',
    fechaInicio: '2026-03-24',
    tipo: 'feriado',
    detalle: 'Feriado nacional en conmemoración del Día Nacional de la Memoria por la Verdad y la Justicia.'
  },
  {
    id: 'malvinas-2026',
    titulo: 'Día del Veterano y los Caídos en la Guerra de Malvinas',
    fechaInicio: '2026-04-02',
    tipo: 'feriado',
    detalle: 'Feriado nacional en homenaje a los veteranos y caídos en Malvinas.'
  },
  {
    id: 'viernes-santo-2026',
    titulo: 'Viernes Santo',
    fechaInicio: '2026-04-03',
    tipo: 'feriado',
    detalle: 'Feriado nacional por festividad religiosa.'
  },
  {
    id: 'trabajador-2026',
    titulo: 'Día del Trabajador',
    fechaInicio: '2026-05-01',
    tipo: 'feriado',
    detalle: 'Feriado nacional por el Día Internacional de los Trabajadores.'
  },
  {
    id: 'docente-tecnologico-2026',
    titulo: 'Día del Docente Tecnológico',
    fechaInicio: '2026-05-02',
    tipo: 'feriado',
    detalle: 'Día del Docente de la Universidad Tecnológica Nacional. Sin actividad académica.'
  },
  {
    id: 'rev-mayo-2026',
    titulo: 'Aniversario de la Revolución de Mayo',
    fechaInicio: '2026-05-25',
    tipo: 'feriado',
    detalle: 'Feriado nacional en conmemoración del aniversario de la Revolución de Mayo.'
  },
  {
    id: 'guemes-2026',
    titulo: 'Paso a la Inmortalidad del General Güemes',
    fechaInicio: '2026-06-15',
    tipo: 'feriado',
    detalle: 'Feriado nacional trasladado.'
  },
  {
    id: 'belgrano-2026',
    titulo: 'Paso a la Inmortalidad del General Manuel Belgrano',
    fechaInicio: '2026-06-20',
    tipo: 'feriado',
    detalle: 'Feriado nacional y Día de la Bandera.'
  },
  {
    id: 'trabajador-estado-2026',
    titulo: 'Día del Trabajador del Estado',
    fechaInicio: '2026-06-27',
    tipo: 'feriado',
    detalle: 'Día del Trabajador del Estado. Sin actividad.'
  },
  {
    id: 'independencia-2026',
    titulo: 'Día de la Independencia',
    fechaInicio: '2026-07-09',
    tipo: 'feriado',
    detalle: 'Feriado nacional por el Día de la Independencia.'
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
    id: 'fundacion-uon-2026',
    titulo: 'Aniversario de la Fundación de la UON',
    fechaInicio: '2026-08-19',
    tipo: 'feriado',
    detalle: 'Aniversario de la creación de la Universidad Obrera Nacional (actual UTN). Sin actividad en el ámbito universitario.'
  },
  {
    id: 'estudiante-2026',
    titulo: 'Día del Estudiante',
    fechaInicio: '2026-09-21',
    tipo: 'feriado',
    detalle: 'Día del Estudiante. Sin actividad académica.'
  },
  {
    id: 'virgen-rosario-2026',
    titulo: 'Día de la Virgen de Rosario',
    fechaInicio: '2026-10-07',
    tipo: 'feriado',
    detalle: 'Festividad de la Virgen del Rosario, patrona de la ciudad de Rosario. Sin actividad académica ni administrativa en UTN FRRo.'
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
    id: 'no-docente-2026',
    titulo: 'Día del No Docente',
    fechaInicio: '2026-11-26',
    tipo: 'feriado',
    detalle: 'Día de los trabajadores no docentes de las Universidades Nacionales. Sin actividad en la facultad.'
  },
  {
    id: 'feriado-turistico-dic-2026',
    titulo: 'Feriado Turístico',
    fechaInicio: '2026-12-07',
    tipo: 'feriado',
    detalle: 'Feriado puente turístico. Sin actividad.'
  },
  {
    id: 'inmaculada-2026',
    titulo: 'Inmaculada Concepción de María',
    fechaInicio: '2026-12-08',
    tipo: 'feriado',
    detalle: 'Feriado nacional.'
  },
  {
    id: 'navidad-2026',
    titulo: 'Navidad',
    fechaInicio: '2026-12-25',
    tipo: 'feriado',
    detalle: 'Feriado nacional de Navidad.'
  },

  // Feriados 2027
  {
    id: 'carnaval-2027',
    titulo: 'Carnaval',
    fechaInicio: '2027-02-08',
    fechaFin: '2027-02-09',
    tipo: 'feriado',
    detalle: 'Feriado nacional de Carnaval (lunes 8 y martes 9 de febrero de 2027). Sin actividad.'
  },
  {
    id: 'memoria-2027',
    titulo: 'Día Nacional de la Memoria por la Verdad y la Justicia',
    fechaInicio: '2027-03-24',
    tipo: 'feriado',
    detalle: 'Feriado nacional (24 de marzo de 2027).'
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

  const diasSemanaMap: Record<number, DiaSemana> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  };

  // Si el turno tiene días específicos no contiguos (ej. Abril, Mayo, Agosto, Septiembre)
  if (turno.diasEspecificos && turno.diasEspecificos.length > 0) {
    const fechaCoincidente = turno.diasEspecificos.find(f => {
      const d = new Date(f + 'T00:00:00');
      return diasSemanaMap[d.getDay()] === diaAsignado;
    });

    if (fechaCoincidente) {
      return {
        fechaExactaStr: fechaCoincidente,
        diaNombre: diaAsignado
      };
    }

    // Si no hay un día específico para este día de la semana (ej. llamado de 3 días)
    return {
      fechaExactaStr: turno.diasEspecificos[0] || turno.fechaInicio,
      diaNombre: diaAsignado
    };
  }

  // Para turnos continuos semanales
  const offset = OFFSET_DIAS[diaAsignado] ?? 0;
  const fechaBase = new Date(turno.fechaInicio + 'T00:00:00');
  
  // Si la fecha de inicio del turno no fuera lunes, alineamos al lunes de referencia
  const diaInicioSemana = fechaBase.getDay();
  const diffDesdeLunes = diaInicioSemana === 0 ? 6 : diaInicioSemana - 1;
  fechaBase.setDate(fechaBase.getDate() - diffDesdeLunes + offset);

  const year = fechaBase.getFullYear();
  const month = String(fechaBase.getMonth() + 1).padStart(2, '0');
  const day = String(fechaBase.getDate()).padStart(2, '0');
  const fechaExactaStr = `${year}-${month}-${day}`;

  return {
    fechaExactaStr,
    diaNombre: diaAsignado
  };
}

