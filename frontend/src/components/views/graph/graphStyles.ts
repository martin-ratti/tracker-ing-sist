import type { Materia, EstadoMateria } from '../../../types/plan';
import type { ThemeConfig, ColorMode } from '../../../context/ThemeContext';
import type { DependenciesTreeResult } from './graphDependencies';

// Materias troncales de la columna vertebral que conducen a Proyecto Final (#36)
export const CADENA_CRITICA_IDS = new Set<number>([
  6,  // Algoritmos y Estructuras de Datos
  8,  // Sistemas y Procesos de Negocio
  5,  // Lógica y Estructuras Discretas
  13, // Sintaxis y Semántica de los Lenguajes
  14, // Paradigmas de Programación
  16, // Análisis de Sistemas de Información
  19, // Base de Datos
  20, // Desarrollo de Software
  23, // Diseño de Sistemas de Información
  25, // Ingeniería y Calidad de Software
  26, // Redes de Datos
  30, // Administración de Sistemas de Información
  36  // Proyecto Final
]);

export interface NodeVisualResult {
  bg: string;
  border: string;
  fontColor: string;
  bw: number;
  shadowColor: string;
  shadowSize: number;
  sig: string;
}

export interface EdgeVisualResult {
  color: string;
  width: number;
  sig: string;
}

export function computeNodeVisualConfig(
  m: Materia,
  estados: Record<number, EstadoMateria>,
  esCursable: boolean,
  esRendible: boolean,
  dependenciesTree: DependenciesTreeResult | null,
  focusedSubjectId: number | null,
  themeConfig: ThemeConfig,
  colorMode: ColorMode,
  criticalChainActive: boolean,
  dimApproved: boolean
): NodeVisualResult {
  const est = estados[m.id] || 'pendiente';

  let bg = themeConfig.graph.pendiente.bg;
  let border = themeConfig.graph.pendiente.border;
  let fontColor = themeConfig.graph.pendiente.font;
  let bw = 1.5;
  let shadowColor = colorMode === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(0,0,0,0.5)';
  let shadowSize = 8;

  if (dependenciesTree) {
    const isSelf = m.id === focusedSubjectId;
    const isAncestorApr = dependenciesTree.ancestorsAprobada.has(m.id);
    const isAncestorReg = dependenciesTree.ancestorsRegular.has(m.id);
    const isDescendantApr = dependenciesTree.descendantsAprobada.has(m.id);
    const isDescendantReg = dependenciesTree.descendantsRegular.has(m.id);
    const inChain = isSelf || isAncestorApr || isAncestorReg || isDescendantApr || isDescendantReg;

    if (!inChain) {
      bg = colorMode === 'light' ? '#f8fafc' : '#080c16';
      border = colorMode === 'light' ? '#cbd5e1' : '#141d2f';
      fontColor = colorMode === 'light' ? '#94a3b8' : '#334155';
      bw = 1;
      shadowSize = 0;
      shadowColor = 'transparent';
    } else if (isSelf) {
      bg = themeConfig.graph.cursable.bg;
      border = colorMode === 'light' ? '#0f172a' : '#ffffff';
      fontColor = colorMode === 'light' ? '#0f172a' : '#ffffff';
      bw = 3.5;
      shadowSize = 20;
      shadowColor = colorMode === 'light' ? 'rgba(15,23,42,0.25)' : 'rgba(255,255,255,0.75)';
    } else if (isAncestorApr || isDescendantApr) {
      bg = themeConfig.graph.aprobada.bg;
      border = themeConfig.graph.aprobada.border;
      fontColor = themeConfig.graph.aprobada.font;
      bw = 2.6;
      shadowSize = 14;
      shadowColor = themeConfig.graph.aprobada.shadow;
    } else if (isAncestorReg || isDescendantReg) {
      bg = themeConfig.graph.regular.bg;
      border = themeConfig.graph.regular.border;
      fontColor = themeConfig.graph.regular.font;
      bw = 2.6;
      shadowSize = 14;
      shadowColor = themeConfig.graph.regular.shadow;
    }
  } else if (criticalChainActive) {
    const inCritical = CADENA_CRITICA_IDS.has(m.id);
    if (!inCritical) {
      bg = colorMode === 'light' ? '#f8fafc' : '#070b14';
      border = colorMode === 'light' ? '#e2e8f0' : '#0f172a';
      fontColor = colorMode === 'light' ? '#94a3b8' : '#334155';
      bw = 1;
      shadowSize = 0;
      shadowColor = 'transparent';
    } else {
      bw = 3;
      if (est === 'aprobada') {
        bg = themeConfig.graph.aprobada.bg;
        border = themeConfig.graph.aprobada.border;
        fontColor = themeConfig.graph.aprobada.font;
        shadowSize = 16;
        shadowColor = themeConfig.graph.aprobada.shadow;
      } else if (est === 'regular') {
        bg = themeConfig.graph.regular.bg;
        border = themeConfig.graph.regular.border;
        fontColor = themeConfig.graph.regular.font;
        shadowSize = 16;
        shadowColor = themeConfig.graph.regular.shadow;
      } else if (esCursable) {
        bg = themeConfig.graph.cursable.bg;
        border = themeConfig.graph.cursable.border;
        fontColor = themeConfig.graph.cursable.font;
        shadowSize = 20;
        shadowColor = themeConfig.graph.cursable.shadow;
      } else {
        bg = themeConfig.graph.pendiente.bg;
        border = themeConfig.graph.pendiente.border;
        fontColor = themeConfig.graph.pendiente.font;
        shadowSize = 8;
        shadowColor = colorMode === 'light' ? 'rgba(15,23,42,0.1)' : 'rgba(0,0,0,0.5)';
      }
    }
  } else {
    if (est === 'aprobada') {
      if (dimApproved) {
        bg = colorMode === 'light' ? '#f1f5f9' : '#090d16';
        border = colorMode === 'light' ? '#cbd5e1' : '#1e293b';
        fontColor = colorMode === 'light' ? '#64748b' : '#475569';
        bw = 1;
        shadowSize = 0;
        shadowColor = 'transparent';
      } else {
        bg = themeConfig.graph.aprobada.bg;
        border = themeConfig.graph.aprobada.border;
        fontColor = themeConfig.graph.aprobada.font;
        bw = 2.4;
        shadowSize = 12;
        shadowColor = themeConfig.graph.aprobada.shadow;
      }
    } else if (est === 'regular') {
      bg = themeConfig.graph.regular.bg;
      border = themeConfig.graph.regular.border;
      fontColor = themeConfig.graph.regular.font;
      bw = 2.4;
      shadowSize = esRendible ? 18 : 12;
      shadowColor = themeConfig.graph.regular.shadow;
    } else if (esCursable) {
      bg = themeConfig.graph.cursable.bg;
      border = themeConfig.graph.cursable.border;
      fontColor = themeConfig.graph.cursable.font;
      bw = 2.8;
      shadowSize = 18;
      shadowColor = themeConfig.graph.cursable.shadow;
    }
  }

  const sig = `${bg}_${border}_${fontColor}_${bw}_${shadowSize}_${dimApproved}_${criticalChainActive}_${focusedSubjectId}`;
  return { bg, border, fontColor, bw, shadowColor, shadowSize, sig };
}

export function computeEdgeVisualConfig(
  fromId: number,
  toId: number,
  tipo: 'regular' | 'aprobada',
  estados: Record<number, EstadoMateria>,
  edgeMode: 'ambos' | 'regular' | 'aprobada',
  dependenciesTree: DependenciesTreeResult | null,
  focusedSubjectId: number | null,
  themeConfig: ThemeConfig,
  colorMode: ColorMode,
  criticalChainActive: boolean,
  dimApproved: boolean
): EdgeVisualResult {
  const estFrom = estados[fromId] || 'pendiente';
  const estTo = estados[toId] || 'pendiente';

  let color = themeConfig.graph.edgeDefault;
  let width = 1.0;
  let hidden = false;

  if (edgeMode === 'regular' && tipo !== 'regular') hidden = true;
  if (edgeMode === 'aprobada' && tipo !== 'aprobada') hidden = true;

  if (dependenciesTree) {
    const isChainEdge =
      (dependenciesTree.ancestors.has(fromId) && (dependenciesTree.ancestors.has(toId) || toId === focusedSubjectId)) ||
      ((dependenciesTree.descendants.has(fromId) || fromId === focusedSubjectId) && dependenciesTree.descendants.has(toId));

    if (isChainEdge) {
      if (tipo === 'aprobada') {
        color = themeConfig.graph.aprobada.border;
        width = 3.0;
      } else {
        color = themeConfig.graph.regular.border;
        width = 2.6;
      }
    } else {
      color = themeConfig.graph.edgeMuted || 'rgba(15,23,42,0.06)';
      width = 0.5;
    }
  } else if (criticalChainActive) {
    const fromInCritical = CADENA_CRITICA_IDS.has(fromId);
    const toInCritical = CADENA_CRITICA_IDS.has(toId);

    if (fromInCritical && toInCritical) {
      if (tipo === 'aprobada') {
        color = themeConfig.graph.aprobada.border;
        width = 3.2;
      } else {
        color = themeConfig.graph.regular.border;
        width = 2.8;
      }
    } else {
      color = colorMode === 'light' ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.04)';
      width = 0.5;
    }
  } else if (!hidden) {
    if (dimApproved && estFrom === 'aprobada' && estTo === 'aprobada') {
      color = colorMode === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)';
      width = 0.8;
    } else if (tipo === 'regular') {
      if (estFrom === 'aprobada') color = themeConfig.graph.aprobada.border;
      else if (estFrom === 'regular') color = themeConfig.graph.regular.border;
      else color = themeConfig.graph.edgeDefault;
    } else {
      if (estFrom === 'aprobada') color = themeConfig.graph.aprobada.border;
      else color = themeConfig.graph.edgeDefault;
    }
  }

  const finalColor = hidden && !dependenciesTree && !criticalChainActive ? 'transparent' : color;
  const sig = `${finalColor}_${width}_${dimApproved}_${criticalChainActive}_${focusedSubjectId}_${tipo}`;
  return { color: finalColor, width, sig };
}
