import type { TurnoExamenOficial, DiaSemana } from './types';

export const REGLA_SYSACAD_EXAMEN = {
  descripcion: 'Una vez habilitado en Sysacad, la inscripción a examen permanecerá abierta hasta las 18:00 hs del penúltimo día hábil previo a la fecha de la mesa.'
};

export const OFFSET_DIAS: Record<DiaSemana, number> = {
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
 * Determina si una fecha específica (YYYY-MM-DD) forma parte activa del turno de examen.
 */
export function isFechaEnTurno(fechaStr: string, turno: TurnoExamenOficial): boolean {
  if (turno.diasEspecificos && turno.diasEspecificos.length > 0) {
    return turno.diasEspecificos.includes(fechaStr);
  }
  return fechaStr >= turno.fechaInicio && fechaStr <= turno.fechaFin;
}

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
export function getFechaExactaMesa(
  materiaId: number, 
  turno: TurnoExamenOficial
): { fechaExactaStr: string; diaNombre: DiaSemana } | null {
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
