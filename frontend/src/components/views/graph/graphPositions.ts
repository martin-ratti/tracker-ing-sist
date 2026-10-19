import { MATERIAS_GRAFO } from './graphDependencies';

export const STORAGE_POSITIONS_KEY = 'tracker_graph_custom_positions';
export const STORAGE_FREE_MODE_KEY = 'tracker_graph_free_mode';

// Niveles académicos oficiales de la carrera (Plan 2023 ISI UTN FRRo)
export const ACADEMIC_LEVELS = [
  [1, 2, 3, 4, 5, 6, 7, 8],          // 1º Nivel (8 materias)
  [9, 10, 11, 12, 13, 14, 15, 16],   // 2º Nivel (8 materias)
  [17, 18, 19, 20, 21, 22, 23],      // 3º Nivel (7 materias)
  [24, 25, 26, 27, 28, 29, 30],      // 4º Nivel (7 materias)
  [31, 32, 33, 34, 35, 36]           // 5º Nivel (6 materias)
];

/**
 * Genera coordenadas canónicas exactas y limpias distribuidas por año y centradas.
 * Garantiza que el Modo Libre inicie 100% idéntico a la malla académica sin colapsar.
 */
export function getCanonicalGraphPositions(direction: 'UD' | 'LR'): Record<number, { x: number; y: number }> {
  const positions: Record<number, { x: number; y: number }> = {};

  if (direction === 'UD') {
    const spacingX = 230;
    const levelSep = 160;

    ACADEMIC_LEVELS.forEach((mats, lvlIdx) => {
      const y = lvlIdx * levelSep;
      const count = mats.length;
      const totalW = (count - 1) * spacingX;
      const startX = -totalW / 2;
      mats.forEach((id, idx) => {
        positions[id] = { x: Math.round(startX + idx * spacingX), y };
      });
    });
  } else {
    const spacingY = 75;
    const levelSep = 270;

    ACADEMIC_LEVELS.forEach((mats, lvlIdx) => {
      const x = lvlIdx * levelSep;
      const count = mats.length;
      const totalH = (count - 1) * spacingY;
      const startY = -totalH / 2;
      mats.forEach((id, idx) => {
        positions[id] = { x, y: Math.round(startY + idx * spacingY) };
      });
    });
  }

  return positions;
}

/**
 * Valida si un objeto de posiciones representa un layout expandido válido
 * y con coherencia académica (Nivel 1 arriba de Nivel 5 en UD).
 */
export function isValidPositions(pos: Record<number, { x: number; y: number }> | null, direction: 'UD' | 'LR' = 'UD'): boolean {
  if (!pos) return false;
  const entries = Object.entries(pos);
  if (entries.length < MATERIAS_GRAFO.length) return false;

  const xs = entries.map(([, p]) => p.x);
  const ys = entries.map(([, p]) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Un diseño válido de 36 materias distribuidas en 5 años mide al menos 600px de extensión
  const width = maxX - minX;
  const height = maxY - minY;
  if (Math.max(width, height) < 600 || Math.min(width, height) < 250) return false;

  // En UD: Nivel 1 debe estar arriba (menor Y promedio) que Nivel 5 (mayor Y promedio)
  if (direction === 'UD') {
    const lvl1Ys = [1, 2, 3, 4, 5, 6, 7, 8].map(id => pos[id]?.y ?? 0);
    const lvl5Ys = [31, 32, 33, 34, 35, 36].map(id => pos[id]?.y ?? 0);
    const avgLvl1 = lvl1Ys.reduce((a, b) => a + b, 0) / lvl1Ys.length;
    const avgLvl5 = lvl5Ys.reduce((a, b) => a + b, 0) / lvl5Ys.length;
    if (avgLvl1 >= avgLvl5 - 100) return false;
  } else {
    // En LR: Nivel 1 debe estar a la izquierda (menor X promedio) que Nivel 5 (mayor X promedio)
    const lvl1Xs = [1, 2, 3, 4, 5, 6, 7, 8].map(id => pos[id]?.x ?? 0);
    const lvl5Xs = [31, 32, 33, 34, 35, 36].map(id => pos[id]?.x ?? 0);
    const avgLvl1 = lvl1Xs.reduce((a, b) => a + b, 0) / lvl1Xs.length;
    const avgLvl5 = lvl5Xs.reduce((a, b) => a + b, 0) / lvl5Xs.length;
    if (avgLvl1 >= avgLvl5 - 100) return false;
  }

  return true;
}

/**
 * Carga las posiciones guardadas en localStorage, limpiando versiones obsoletas o corruptas.
 */
export function loadSavedPositions(): Record<number, { x: number; y: number }> | null {
  if (typeof window === 'undefined') return null;
  try {
    // Limpiar versiones obsoletas con residuos corruptos
    localStorage.removeItem('tracker_graph_positions');
    localStorage.removeItem('tracker_graph_positions_v2');

    const raw = localStorage.getItem(STORAGE_POSITIONS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidPositions(parsed)) {
      localStorage.removeItem(STORAGE_POSITIONS_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
