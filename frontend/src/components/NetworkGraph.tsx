import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import { useTracker } from '../context/TrackerContext';
import { useTheme } from '../context/ThemeContext';
import { MATERIAS_TRONCALES, MATERIAS_MAP } from '../data/plan2023';
import { ZoomIn, ZoomOut, Maximize2, X, Compass, MousePointerClick, Eye, EyeOff, Sparkles } from 'lucide-react';

import type { Node as VisBaseNode, Edge as VisBaseEdge } from 'vis-network/standalone';

interface VisNode extends VisBaseNode {
  id: number;
}

interface VisEdge extends VisBaseEdge {
  id: number;
  from: number;
  to: number;
  tipo: 'regular' | 'aprobada';
}

const MATERIAS_GRAFO = MATERIAS_TRONCALES.filter(m => !m.esAdusiSolo);

// Materias troncales de la columna vertebral que conducen a Proyecto Final (#36)
const CADENA_CRITICA_IDS = new Set<number>([
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

export const NetworkGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesDatasetRef = useRef<DataSet<VisNode> | null>(null);
  const edgesDatasetRef = useRef<DataSet<VisEdge> | null>(null);

  const [interactionMode, setInteractionMode] = useState<'estado' | 'camino'>('estado');
  const interactionModeRef = useRef<'estado' | 'camino'>('estado');

  const toggleMateriaEstadoRef = useRef<(id: number) => void>(() => {});
  const setSelectedSubjectIdRef = useRef<(id: number | null) => void>(() => {});
  const setFocusedSubjectIdRef = useRef<(id: number | null) => void>(() => {});
  const prevNodeSignaturesRef = useRef<Map<number, string>>(new Map());
  const prevEdgeSignaturesRef = useRef<Map<number, string>>(new Map());

  const {
    estados,
    edgeMode,
    toggleMateriaEstado,
    esMateriaCursable,
    esMateriaRendible,
    setSelectedSubjectId,
    focusedSubjectId,
    setFocusedSubjectId,
    dimApproved,
    setDimApproved,
    criticalChainActive,
    setCriticalChainActive
  } = useTracker();

  const { themeConfig, colorMode } = useTheme();

  useEffect(() => {
    interactionModeRef.current = interactionMode;
  }, [interactionMode]);

  useEffect(() => {
    toggleMateriaEstadoRef.current = toggleMateriaEstado;
  }, [toggleMateriaEstado]);

  useEffect(() => {
    setSelectedSubjectIdRef.current = setSelectedSubjectId;
  }, [setSelectedSubjectId]);

  useEffect(() => {
    setFocusedSubjectIdRef.current = setFocusedSubjectId;
  }, [setFocusedSubjectId]);

  // Cálculo de dependencias (Camino Crítico: ancestros y descendientes)
  const dependenciesTree = useMemo(() => {
    if (!focusedSubjectId) return null;

    const ancestors = new Set<number>();
    const descendants = new Set<number>();

    function findAncestors(currId: number) {
      const m = MATERIAS_MAP[currId];
      if (!m) return;
      const reqs = [
        ...m.reqRegular,
        ...(Array.isArray(m.reqAprobada) ? m.reqAprobada : []),
        ...(Array.isArray(m.reqRendirAprobada) ? m.reqRendirAprobada : [])
      ];
      reqs.forEach(r => {
        if (!ancestors.has(r)) {
          ancestors.add(r);
          findAncestors(r);
        }
      });
    }

    function findDescendants(currId: number) {
      MATERIAS_GRAFO.forEach(candidate => {
        const depends =
          candidate.reqRegular.includes(currId) ||
          (Array.isArray(candidate.reqAprobada) && candidate.reqAprobada.includes(currId)) ||
          (Array.isArray(candidate.reqRendirAprobada) && candidate.reqRendirAprobada.includes(currId));

        if (depends && !descendants.has(candidate.id)) {
          descendants.add(candidate.id);
          findDescendants(candidate.id);
        }
      });
    }

    findAncestors(focusedSubjectId);
    findDescendants(focusedSubjectId);

    return { ancestors, descendants };
  }, [focusedSubjectId]);

  // Función pura para obtener configuración visual de un nodo según estado, tema y camino crítico
  const getNodeVisualConfig = useCallback((m: (typeof MATERIAS_GRAFO)[0]) => {
    const est = estados[m.id] || 'pendiente';
    const cursable = esMateriaCursable(m);
    const rendible = esMateriaRendible(m);

    let bg = themeConfig.graph.pendiente.bg;
    let border = themeConfig.graph.pendiente.border;
    let fontColor = themeConfig.graph.pendiente.font;
    let bw = 1.5;
    let shadowColor = colorMode === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(0,0,0,0.5)';
    let shadowSize = 8;

    if (dependenciesTree) {
      const isSelf = m.id === focusedSubjectId;
      const isAncestor = dependenciesTree.ancestors.has(m.id);
      const isDescendant = dependenciesTree.descendants.has(m.id);
      const inChain = isSelf || isAncestor || isDescendant;

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
      } else if (isAncestor) {
        bg = colorMode === 'light' ? '#e0f2fe' : '#042232';
        border = colorMode === 'light' ? '#0284c7' : '#38bdf8';
        fontColor = colorMode === 'light' ? '#0369a1' : '#7dd3fc';
        bw = 2.5;
        shadowSize = 14;
        shadowColor = colorMode === 'light' ? 'rgba(2,132,199,0.3)' : 'rgba(56,189,248,0.5)';
      } else if (isDescendant) {
        bg = colorMode === 'light' ? '#fef3c7' : '#331b04';
        border = colorMode === 'light' ? '#d97706' : '#f59e0b';
        fontColor = colorMode === 'light' ? '#b45309' : '#fbbf24';
        bw = 2.5;
        shadowSize = 14;
        shadowColor = colorMode === 'light' ? 'rgba(217,119,6,0.3)' : 'rgba(245,158,11,0.5)';
      }
    } else if (criticalChainActive) {
      const inCritical = CADENA_CRITICA_IDS.has(m.id);
      if (!inCritical) {
        bg = colorMode === 'light' ? '#f8fafc' : '#080c16';
        border = colorMode === 'light' ? '#e2e8f0' : '#141d2f';
        fontColor = colorMode === 'light' ? '#94a3b8' : '#334155';
        bw = 1;
        shadowSize = 0;
        shadowColor = 'transparent';
      } else {
        if (m.id === 36) {
          bg = colorMode === 'light' ? '#fef9c3' : '#382502';
          border = '#eab308';
          fontColor = colorMode === 'light' ? '#854d0e' : '#fef08a';
          bw = 3.5;
          shadowColor = 'rgba(234,179,8,0.6)';
          shadowSize = 20;
        } else if (est === 'aprobada') {
          bg = themeConfig.graph.aprobada.bg;
          border = '#10b981';
          fontColor = themeConfig.graph.aprobada.font;
          bw = 2.8;
          shadowColor = 'rgba(16,185,129,0.4)';
          shadowSize = 14;
        } else if (est === 'regular') {
          bg = themeConfig.graph.regular.bg;
          border = '#f59e0b';
          fontColor = themeConfig.graph.regular.font;
          bw = 2.8;
          shadowColor = 'rgba(245,158,11,0.45)';
          shadowSize = 14;
        } else if (cursable) {
          bg = themeConfig.graph.cursable.bg;
          border = '#06b6d4';
          fontColor = themeConfig.graph.cursable.font;
          bw = 3;
          shadowColor = 'rgba(6,182,212,0.6)';
          shadowSize = 18;
        } else {
          bg = colorMode === 'light' ? '#e0f2fe' : '#071f30';
          border = '#0284c7';
          fontColor = colorMode === 'light' ? '#0369a1' : '#7dd3fc';
          bw = 2.2;
          shadowColor = 'rgba(2,132,199,0.3)';
          shadowSize = 10;
        }
      }
    } else {
      if (est === 'aprobada') {
        if (dimApproved) {
          bg = colorMode === 'light' ? '#f1f5f9' : '#080d17';
          border = colorMode === 'light' ? '#cbd5e1' : '#172236';
          fontColor = colorMode === 'light' ? '#64748b' : '#3e4c5f';
          bw = 1;
          shadowColor = 'transparent';
          shadowSize = 0;
        } else {
          bg = themeConfig.graph.aprobada.bg;
          border = themeConfig.graph.aprobada.border;
          fontColor = themeConfig.graph.aprobada.font;
          bw = 2.2;
          shadowColor = themeConfig.graph.aprobada.shadow;
          shadowSize = 10;
        }
      } else if (est === 'regular') {
        bg = themeConfig.graph.regular.bg;
        border = themeConfig.graph.regular.border;
        fontColor = themeConfig.graph.regular.font;
        bw = 2.2;
        shadowColor = rendible ? themeConfig.graph.regular.shadow : (colorMode === 'light' ? 'rgba(217,119,6,0.15)' : 'rgba(245,158,11,0.25)');
        shadowSize = rendible ? 14 : 8;
      } else if (cursable) {
        bg = themeConfig.graph.cursable.bg;
        border = themeConfig.graph.cursable.border;
        fontColor = themeConfig.graph.cursable.font;
        bw = 2.2;
        shadowColor = themeConfig.graph.cursable.shadow;
        shadowSize = 14;
      }
    }

    const sig = `${themeConfig.id}_${colorMode}_${dimApproved}_${criticalChainActive}_${bg}_${border}_${fontColor}_${bw}_${shadowSize}_${shadowColor}`;
    return { bg, border, fontColor, bw, shadowColor, shadowSize, sig };
  }, [estados, esMateriaCursable, esMateriaRendible, themeConfig, colorMode, dependenciesTree, focusedSubjectId, dimApproved, criticalChainActive]);

  // Función pura para obtener configuración visual de una arista
  const getEdgeVisualConfig = useCallback((fromId: number, toId: number, tipo: 'regular' | 'aprobada') => {
    const estFrom = estados[fromId] || 'pendiente';
    const estTo = estados[toId] || 'pendiente';
    const hidden = edgeMode !== 'ambos' && tipo !== edgeMode;

    let color = themeConfig.graph.edgeDefault || '#1e293b';
    let width = tipo === 'aprobada' ? 2.2 : 1.4;

    if (dependenciesTree) {
      const fromInChain = fromId === focusedSubjectId || dependenciesTree.ancestors.has(fromId) || dependenciesTree.descendants.has(fromId);
      const toInChain = toId === focusedSubjectId || dependenciesTree.ancestors.has(toId) || dependenciesTree.descendants.has(toId);

      if (fromInChain && toInChain) {
        color = colorMode === 'light' ? '#0284c7' : '#38bdf8';
        width = 2.8;
      } else {
        color = themeConfig.graph.edgeMuted || 'rgba(15,23,42,0.06)';
        width = 0.5;
      }
    } else if (criticalChainActive) {
      const fromInCritical = CADENA_CRITICA_IDS.has(fromId);
      const toInCritical = CADENA_CRITICA_IDS.has(toId);

      if (fromInCritical && toInCritical) {
        color = colorMode === 'light' ? '#0891b2' : '#22d3ee';
        width = 3.0;
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
        else if (estFrom === 'regular') color = themeConfig.graph.cursable.border;
        else color = themeConfig.graph.edgeDefault;
      } else {
        if (estFrom === 'aprobada') color = themeConfig.graph.regular.border;
        else color = themeConfig.graph.edgeDefault;
      }
    }

    const finalColor = hidden && !dependenciesTree && !criticalChainActive ? 'transparent' : color;
    const sig = `${finalColor}_${width}_${dimApproved}_${criticalChainActive}`;
    return { color: finalColor, width, sig };
  }, [estados, edgeMode, dependenciesTree, focusedSubjectId, themeConfig, colorMode, criticalChainActive, dimApproved]);

  // Inicializar vis-network una sola vez con los colores reales de entrada
  useEffect(() => {
    if (!containerRef.current) return;

    const initialNodes: VisNode[] = MATERIAS_GRAFO.map(m => {
      const cfg = getNodeVisualConfig(m);
      prevNodeSignaturesRef.current.set(m.id, cfg.sig);
      return {
        id: m.id,
        label: m.nombre,
        level: m.nivel,
        shape: 'box',
        borderRadius: 8,
        margin: { top: 10, bottom: 10, left: 14, right: 14 },
        color: { background: cfg.bg, border: cfg.border },
        font: { color: cfg.fontColor, size: 13, face: 'IBM Plex Mono' },
        borderWidth: cfg.bw,
        shadow: { enabled: cfg.shadowSize > 0, color: cfg.shadowColor, size: cfg.shadowSize, x: 0, y: 3 }
      };
    });

    let edgeId = 1;
    const rawEdges: VisEdge[] = [];
    MATERIAS_GRAFO.forEach(m => {
      m.reqRegular.forEach(c => {
        const id = edgeId++;
        const cfg = getEdgeVisualConfig(c, m.id, 'regular');
        prevEdgeSignaturesRef.current.set(id, cfg.sig);
        rawEdges.push({
          id,
          from: c,
          to: m.id,
          tipo: 'regular',
          color: { color: cfg.color, opacity: 0.8 },
          width: cfg.width,
          arrows: { to: { enabled: true, scaleFactor: 0.45, type: 'arrow' } },
          smooth: { enabled: true, type: 'cubicBezier', roundness: 0.5 }
        });
      });

      if (m.reqAprobada !== 'TODAS') {
        m.reqAprobada.forEach(c => {
          const id = edgeId++;
          const cfg = getEdgeVisualConfig(c, m.id, 'aprobada');
          prevEdgeSignaturesRef.current.set(id, cfg.sig);
          rawEdges.push({
            id,
            from: c,
            to: m.id,
            tipo: 'aprobada',
            color: { color: cfg.color, opacity: 0.8 },
            width: cfg.width,
            arrows: { to: { enabled: true, scaleFactor: 0.5, type: 'arrow' } },
            smooth: { enabled: true, type: 'cubicBezier', roundness: 0.5 }
          });
        });
      }
    });

    const nodesDataSet = new DataSet<VisNode>(initialNodes);
    const edgesDataSet = new DataSet<VisEdge>(rawEdges);

    nodesDatasetRef.current = nodesDataSet;
    edgesDatasetRef.current = edgesDataSet;

    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'UD',
          levelSeparation: 150,
          nodeSpacing: 140,
          treeSpacing: 180,
          sortMethod: 'directed'
        }
      },
      physics: false,
      interaction: {
        selectConnectedEdges: false,
        hover: true,
        tooltipDelay: 99999,
        zoomView: true,
        dragView: true
      },
      nodes: { chosen: false },
      edges: { chosen: false }
    };

    const net = new Network(containerRef.current, { nodes: nodesDataSet, edges: edgesDataSet }, options as any);
    networkRef.current = net;

    net.on('click', params => {
      if (params.nodes.length > 0) {
        const clickedId = Number(params.nodes[0]);
        if (interactionModeRef.current === 'camino') {
          setFocusedSubjectIdRef.current(clickedId);
        } else {
          toggleMateriaEstadoRef.current(clickedId);
        }
      } else {
        setFocusedSubjectIdRef.current(null);
      }
    });

    net.on('doubleClick', params => {
      if (params.nodes.length > 0) {
        const clickedId = Number(params.nodes[0]);
        setSelectedSubjectIdRef.current(clickedId);
      }
    });

    net.on('oncontext', params => {
      params.event.preventDefault();
      const nodeId = net.getNodeAt(params.pointer.DOM);
      if (nodeId !== undefined) {
        setSelectedSubjectIdRef.current(Number(nodeId));
      }
    });

    // Garantizar que vis-network redibuje después de que el layout esté listo
    net.once('afterDrawing', () => {
      net.redraw();
    });

    const initialRedrawTimer = setTimeout(() => {
      net.redraw();
    }, 80);

    const handleResize = () => {
      net.redraw();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initialRedrawTimer);
      window.removeEventListener('resize', handleResize);
      net.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar nodos y aristas cuando cambian los estados, temas, filtros o camino crítico
  useEffect(() => {
    if (!nodesDatasetRef.current || !edgesDatasetRef.current) return;

    const nodeUpdates: Partial<VisNode>[] = [];
    const nextNodeSignatures = new Map<number, string>();

    MATERIAS_GRAFO.forEach(m => {
      const cfg = getNodeVisualConfig(m);
      nextNodeSignatures.set(m.id, cfg.sig);

      if (prevNodeSignaturesRef.current.get(m.id) !== cfg.sig) {
        nodeUpdates.push({
          id: m.id,
          color: { background: cfg.bg, border: cfg.border },
          font: { color: cfg.fontColor, size: 13, face: 'IBM Plex Mono' },
          borderWidth: cfg.bw,
          shadow: { enabled: cfg.shadowSize > 0, color: cfg.shadowColor, size: cfg.shadowSize, x: 0, y: 3 }
        });
      }
    });

    if (nodeUpdates.length > 0) {
      nodesDatasetRef.current.update(nodeUpdates as VisNode[]);
    }
    prevNodeSignaturesRef.current = nextNodeSignatures;

    // Actualizar aristas con diffing
    const edgeUpdates: Partial<VisEdge>[] = [];
    const nextEdgeSignatures = new Map<number, string>();

    edgesDatasetRef.current.forEach(edge => {
      const fromId = Number(edge.from);
      const toId = Number(edge.to);
      const cfg = getEdgeVisualConfig(fromId, toId, edge.tipo);
      nextEdgeSignatures.set(edge.id, cfg.sig);

      if (prevEdgeSignaturesRef.current.get(edge.id) !== cfg.sig) {
        edgeUpdates.push({
          id: edge.id,
          color: { color: cfg.color },
          width: cfg.width
        });
      }
    });

    if (edgeUpdates.length > 0) {
      edgesDatasetRef.current.update(edgeUpdates as VisEdge[]);
    }
    prevEdgeSignaturesRef.current = nextEdgeSignatures;

    // Redibujar explícitamente el canvas de vis-network cuando hay cambios
    networkRef.current?.redraw();
  }, [getNodeVisualConfig, getEdgeVisualConfig]);

  const handleZoomIn = () => {
    if (!networkRef.current) return;
    const scale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: scale * 1.25 });
  };

  const handleZoomOut = () => {
    if (!networkRef.current) return;
    const scale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: scale * 0.8 });
  };

  const handleFit = () => {
    if (!networkRef.current) return;
    networkRef.current.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
  };

  return (
    <div 
      className="relative w-full h-[calc(100vh-125px)] overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: themeConfig.graph.bgBase }}
    >
      <div 
        ref={containerRef} 
        tabIndex={0}
        role="region"
        aria-label="Grafo interactivo de correlatividades"
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none focus-visible:ring-1 focus-visible:ring-slate-500" 
      />

      {/* Banner flotante de Camino Crítico activo */}
      {focusedSubjectId && MATERIAS_MAP[focusedSubjectId] && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-3 bg-[var(--bg-surface)]/95 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)] py-2 px-4 rounded-xl font-mono text-xs animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-slate-500 dark:text-slate-400">Camino Crítico:</span>
            <span className="font-bold text-[var(--text-body)]">{MATERIAS_MAP[focusedSubjectId].nombreCompleto}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-semibold">
              {dependenciesTree?.ancestors.size || 0} requisitos
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-semibold">
              {dependenciesTree?.descendants.size || 0} desbloquea
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => setSelectedSubjectId(focusedSubjectId)}
              className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] text-cyan-700 dark:text-cyan-300 text-[11px] transition-colors border border-[var(--border-color)]"
            >
              Ficha
            </button>
            <button
              onClick={() => setFocusedSubjectId(null)}
              className="p-1 rounded text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-elevated)] transition-colors"
              title="Restablecer vista completa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Banner flotante de Cadena Crítica hacia Graduación */}
      {criticalChainActive && !focusedSubjectId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-3 bg-[var(--bg-surface)]/95 backdrop-blur-md border border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)] py-2 px-4 rounded-xl font-mono text-xs animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-bold text-[var(--text-body)]">Columna Vertebral: Proyecto Final</span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">(13 materias clave)</span>
          </div>

          <button
            onClick={() => setCriticalChainActive(false)}
            className="p-1 rounded text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-elevated)] transition-colors ml-1"
            title="Desactivar filtro de cadena crítica"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controles flotantes superiores derechos */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex flex-col items-end gap-2">
        {/* Selector de modo de interacción */}
        <div className="flex items-center bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-color)] p-1 rounded-xl shadow-lg font-mono text-xs">
          <button
            type="button"
            onClick={() => setInteractionMode('estado')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors min-h-[36px] ${
              interactionMode === 'estado'
                ? 'bg-[var(--bg-elevated)] text-[var(--text-body)] font-bold border border-[var(--border-color)] shadow-sm'
                : 'text-slate-700 dark:text-slate-300 font-semibold hover:text-[var(--text-body)]'
            }`}
            title="Al hacer clic en una materia, cambia entre Pendiente, Regular y Aprobada"
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>Alternar Estado</span>
          </button>

          <button
            type="button"
            onClick={() => setInteractionMode('camino')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors min-h-[36px] ${
              interactionMode === 'camino'
                ? 'bg-cyan-500/20 text-cyan-950 dark:text-cyan-300 font-bold border border-cyan-500/50 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 font-semibold hover:text-[var(--text-body)]'
            }`}
            title="Al hacer clic en una materia, resalta toda su cadena de requisitos y materias desbloqueadas"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Camino Crítico</span>
          </button>
        </div>

        {/* Filtros visuales rápidos: Atenuar Aprobadas & Cadena Crítica */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-color)] p-1 rounded-xl shadow-lg font-mono text-xs">
          <button
            type="button"
            onClick={() => setDimApproved(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors min-h-[34px] ${
              dimApproved
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 font-semibold hover:text-[var(--text-body)]'
            }`}
            title="Atenuar materias ya aprobadas para concentrarse en las materias pendientes y regulares"
          >
            {dimApproved ? <EyeOff className="w-3.5 h-3.5 text-emerald-500" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Atenuar Aprobadas</span>
          </button>

          <button
            type="button"
            onClick={() => setCriticalChainActive(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors min-h-[34px] ${
              criticalChainActive
                ? 'bg-amber-500/25 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/50 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 font-semibold hover:text-[var(--text-body)]'
            }`}
            title="Destacar la cadena crítica indispensable hacia el Proyecto Final de carrera"
          >
            <Sparkles className={`w-3.5 h-3.5 ${criticalChainActive ? 'text-amber-400 animate-pulse' : ''}`} />
            <span>Cadena Crítica</span>
          </button>
        </div>
      </div>

      {/* Controles flotantes de Zoom con touch targets de 44px */}
      <div className="absolute bottom-5 right-4 md:right-5 flex flex-col gap-1.5 bg-[var(--bg-surface)]/95 backdrop-blur-md p-1 rounded-xl border border-[var(--border-color)] shadow-xl z-10">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Acercar vista del grafo"
          className="p-2.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--bg-elevated)] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Alejar vista del grafo"
          className="p-2.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--bg-elevated)] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleFit}
          aria-label="Ajustar y centrar grafo"
          className="p-2.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--bg-elevated)] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          title="Ajustar y Centrar"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Guía rápida flotante */}
      <div className="absolute bottom-5 left-5 hidden md:flex items-center gap-4 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-color)] text-[11px] font-mono text-slate-800 dark:text-slate-200 pointer-events-none shadow-md font-medium">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-body)] font-bold">Click</kbd>
          <span>{interactionMode === 'camino' ? 'Resaltar dependencias' : 'Cambiar estado'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-body)] font-bold">Doble Click</kbd>
          <span>Detalles y notas</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-body)] font-bold">Fondo</kbd>
          <span>Desactivar foco</span>
        </span>
      </div>
    </div>
  );
};
