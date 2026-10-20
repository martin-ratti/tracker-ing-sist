import type { EstadoMateria, Materia, NotaMateria, MetaExamen } from '../types/plan';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS, MATERIAS_MAP } from '../data/plan2023';
import { TURNOS_EXAMEN, getFechaExactaMesa } from '../data/calendario';

export interface ProximaMetaInfo {
  materiaId: number;
  materiaNombre: string;
  materiaNombreCorto: string;
  turnoNombre: string;
  fechaExamenStr: string;
  diasFaltantes: number;
  urgencia: 'urgente' | 'proxima' | 'lejana';
}

export interface AcademicStats {
  aprobadasCount: number;
  regularesCount: number;
  cursablesCount: number;
  totalTroncales: number;
  porcentajeCarrera: number;
  horasElectivasAprobadas: number;
  promedio: number | null;
  promedioConAplazos: number | null;
  promedioSinAplazos: number | null;
  adusiCumplido: boolean;
  adusiProgreso: number; // 0 - 100
  adusiFaltantes: string[];
  ingenieroCumplido: boolean;
  ingenieroProgreso: number; // 0 - 100
  ingenieroFaltantes: string[];
  metasCount: number;
  proximaMeta: ProximaMetaInfo | null;
}

/**
 * Encuentra la meta de examen más cercana en el futuro que aún no haya sido aprobada.
 */
export function findUpcomingExamMeta(
  metasExamen: Record<number, MetaExamen>,
  getEstado: (id: number) => EstadoMateria,
  baseDate: Date = new Date()
): ProximaMetaInfo | null {
  const now = new Date(baseDate);
  now.setHours(0, 0, 0, 0);

  const metasArray = Object.values(metasExamen);
  if (metasArray.length === 0) return null;

  const metasFuturas: ProximaMetaInfo[] = [];

  for (const meta of metasArray) {
    if (getEstado(meta.materiaId) === 'aprobada') continue;

    const materia = MATERIAS_MAP[meta.materiaId];
    let fechaStr = meta.fechaEstimada;

    if (!fechaStr) {
      const turno = TURNOS_EXAMEN.find(t => t.id === meta.turnoId);
      if (turno) {
        const fechaExacta = getFechaExactaMesa(meta.materiaId, turno);
        fechaStr = fechaExacta ? fechaExacta.fechaExactaStr : turno.fechaInicio;
      }
    }

    if (fechaStr) {
      const target = new Date(fechaStr + 'T00:00:00');
      const diffMs = target.getTime() - now.getTime();
      const diasFaltantes = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diasFaltantes >= 0) {
        const urgencia: 'urgente' | 'proxima' | 'lejana' =
          diasFaltantes <= 7 ? 'urgente' : diasFaltantes <= 30 ? 'proxima' : 'lejana';

        metasFuturas.push({
          materiaId: meta.materiaId,
          materiaNombre: materia ? materia.nombreCompleto : `Materia #${meta.materiaId}`,
          materiaNombreCorto: materia ? materia.nombre : `#${meta.materiaId}`,
          turnoNombre: meta.turnoNombre,
          fechaExamenStr: fechaStr,
          diasFaltantes,
          urgencia
        });
      }
    }
  }

  metasFuturas.sort((a, b) => a.diasFaltantes - b.diasFaltantes);
  return metasFuturas[0] || null;
}

/**
 * Calcula todas las métricas académicas (ADUSI, Ingeniería, horas, promedios y porcentajes).
 */
export function computeAcademicStats(
  estados: Record<number, EstadoMateria>,
  estadosElectivas: Record<number, EstadoMateria>,
  notas: Record<number, NotaMateria>,
  ppsHoras: number,
  metasExamen: Record<number, MetaExamen>,
  isCursable: (m: Materia) => boolean
): AcademicStats {
  const getEstado = (id: number): EstadoMateria => estados[id] || 'pendiente';
  const getEstadoElectiva = (id: number): EstadoMateria => estadosElectivas[id] || 'pendiente';

  const troncalesArray = MATERIAS_TRONCALES.filter(m => !m.esAdusiSolo);
  const aprobadas = troncalesArray.filter(m => getEstado(m.id) === 'aprobada').length;
  const regulares = troncalesArray.filter(m => getEstado(m.id) === 'regular').length;
  const cursables = troncalesArray.filter(m => isCursable(m)).length;
  const totalTroncales = troncalesArray.length;
  const porcentajeCarrera = Number(((aprobadas / totalTroncales) * 100).toFixed(1));

  // Electivas
  const electivasAprobadas = MATERIAS_ELECTIVAS.filter(e => getEstadoElectiva(e.id) === 'aprobada');
  const horasElectivasAprobadas = electivasAprobadas.reduce((acc, curr) => acc + curr.horas, 0);

  // Promedio (calculado exclusivamente sobre materias efectivamente aprobadas)
  let notasSuma = 0;
  let notasCount = 0;

  Object.entries(notas).forEach(([idStr, n]) => {
    const id = Number(idStr);
    const estaAprobada = getEstado(id) === 'aprobada' || getEstadoElectiva(id) === 'aprobada';
    if (estaAprobada && n && typeof n.nota === 'number' && !isNaN(n.nota)) {
      notasSuma += n.nota;
      notasCount += 1;
    }
  });

  const promedio = notasCount > 0 ? Number((notasSuma / notasCount).toFixed(2)) : null;

  // ADUSI: 1º, 2º y 3º año completos (id 1 a 23) + Seminario Integrador (id 99) + >= 4hs electivas
  const materiasAdusi = MATERIAS_TRONCALES.filter(m => m.nivel <= 3 && !m.esAdusiSolo);
  const adusiTroncalesAprobadas = materiasAdusi.every(m => getEstado(m.id) === 'aprobada');
  const seminarioAprobado = getEstado(99) === 'aprobada';
  const adusiElectivasOk = horasElectivasAprobadas >= 4;

  const adusiFaltantes: string[] = [];
  if (!adusiTroncalesAprobadas) {
    const faltan = materiasAdusi.filter(m => getEstado(m.id) !== 'aprobada').map(m => m.nombre);
    adusiFaltantes.push(`Materias 1°-3° nivel (${faltan.length} pendientes)`);
  }
  if (!seminarioAprobado) adusiFaltantes.push('Seminario Integrador');
  if (!adusiElectivasOk) adusiFaltantes.push(`Electivas (${horasElectivasAprobadas}/4 hs)`);

  const adusiPuntosTotales = materiasAdusi.length + 1 + 1;
  let adusiPuntosActuales = materiasAdusi.filter(m => getEstado(m.id) === 'aprobada').length;
  if (seminarioAprobado) adusiPuntosActuales += 1;
  if (adusiElectivasOk) adusiPuntosActuales += 1;
  const adusiProgreso = Math.round((adusiPuntosActuales / adusiPuntosTotales) * 100);

  const adusiCumplido = adusiTroncalesAprobadas && seminarioAprobado && adusiElectivasOk;

  // Ingeniero: 36 troncales + 20hs electivas + 200hs PPS
  const todasTroncalesOk = aprobadas === totalTroncales;
  const ingElectivasOk = horasElectivasAprobadas >= 20;
  const ppsOk = ppsHoras >= 200;

  const ingenieroFaltantes: string[] = [];
  if (!todasTroncalesOk) ingenieroFaltantes.push(`Troncales (${totalTroncales - aprobadas} pendientes)`);
  if (!ingElectivasOk) ingenieroFaltantes.push(`Electivas (${horasElectivasAprobadas}/20 hs)`);
  if (!ppsOk) ingenieroFaltantes.push(`PPS (${ppsHoras}/200 hs)`);

  // Ponderación de Ingeniería: 90% Troncales, 5% Electivas, 5% PPS
  const progresoTroncales = totalTroncales > 0 ? (aprobadas / totalTroncales) * 90 : 0;
  const progresoElectivas = (Math.min(horasElectivasAprobadas, 20) / 20) * 5;
  const progresoPPS = (Math.min(ppsHoras, 200) / 200) * 5;
  const ingenieroProgreso = Math.min(100, Math.round(progresoTroncales + progresoElectivas + progresoPPS));

  const ingenieroCumplido = todasTroncalesOk && ingElectivasOk && ppsOk;
  const metasCount = Object.keys(metasExamen).length;
  const proximaMeta = findUpcomingExamMeta(metasExamen, getEstado);

  return {
    aprobadasCount: aprobadas,
    regularesCount: regulares,
    cursablesCount: cursables,
    totalTroncales,
    porcentajeCarrera,
    horasElectivasAprobadas,
    promedio,
    promedioConAplazos: promedio,
    promedioSinAplazos: promedio,
    adusiCumplido,
    adusiProgreso,
    adusiFaltantes,
    ingenieroCumplido,
    ingenieroProgreso,
    ingenieroFaltantes,
    metasCount,
    proximaMeta
  };
}
