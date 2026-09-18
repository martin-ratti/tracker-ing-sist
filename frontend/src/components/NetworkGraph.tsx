import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import { useTracker } from '../context/TrackerContext';
import { useTheme } from '../context/ThemeContext';
import { MATERIAS_TRONCALES, MATERIAS_MAP } from '../data/plan2023';
import { ZoomIn, ZoomOut, Maximize2, X, Compass, MousePointerClick } from 'lucide-react';

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
    setFocusedSubjectId
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

  // Inicializar vis-network una sola vez
  useEffect(() => {
    if (!containerRef.current) return;

    const initialNodes: VisNode[] = MATERIAS_GRAFO.map(m => ({
      id: m.id,
      label: m.nombre,
      level: m.nivel,
      shape: 'box',
      borderRadius: 8,
      margin: { top: 10, bottom: 10, left: 14, right: 14 },
      color: { background: themeConfig.graph.pendiente.bg, border: themeConfig.graph.pendiente.border },
      font: { color: themeConfig.graph.pendiente.font, size: 13, face: 'IBM Plex Mono' },
      borderWidth: 1.5,
      shadow: { enabled: true, color: colorMode === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(0,0,0,0.5)', size: 8, x: 0, y: 3 }
    }));

    let edgeId = 1;
    const rawEdges: VisEdge[] = [];
    MATERIAS_GRAFO.forEach(m => {
      m.reqRegular.forEach(c => {
        rawEdges.push({
          id: edgeId++,
          from: c,
          to: m.id,
          tipo: 'regular',
          color: { color: themeConfig.graph.edgeDefault, opacity: 0.8 },
          width: 1.4,
          arrows: { to: { enabled: true, scaleFactor: 0.45, type: 'arrow' } },
          smooth: { enabled: true, type: 'cubicBezier', roundness: 0.5 }
        });
      });

      if (m.reqAprobada !== 'TODAS') {
        m.reqAprobada.forEach(c => {
          rawEdges.push({
            id: edgeId++,
            from: c,
            to: m.id,
            tipo: 'aprobada',
            color: { color: themeConfig.graph.edgeDefault, opacity: 0.8 },
            width: 2.2,
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

    const handleResize = () => {
      net.redraw();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      net.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Actualizar nodos y aristas cuando cambian los estados, temas, filtros o camino crítico
  useEffect(() => {
    if (!nodesDatasetRef.current || !edgesDatasetRef.current) return;

    const nodeUpdates: Partial<VisNode>[] = [];
    const nextNodeSignatures = new Map<number, string>();

    MATERIAS_GRAFO.forEach(m => {
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
      } else {
        if (est === 'aprobada') {
          bg = themeConfig.graph.aprobada.bg;
          border = themeConfig.graph.aprobada.border;
          fontColor = themeConfig.graph.aprobada.font;
          bw = 2.2;
          shadowColor = themeConfig.graph.aprobada.shadow;
          shadowSize = 10;
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

      const sig = `${themeConfig.id}_${colorMode}_${bg}_${border}_${fontColor}_${bw}_${shadowSize}_${shadowColor}`;
      nextNodeSignatures.set(m.id, sig);

      if (prevNodeSignaturesRef.current.get(m.id) !== sig) {
        nodeUpdates.push({
          id: m.id,
          color: { background: bg, border },
          font: { color: fontColor, size: 13, face: 'IBM Plex Mono' },
          borderWidth: bw,
          shadow: { enabled: shadowSize > 0, color: shadowColor, size: shadowSize, x: 0, y: 3 }
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
      const estFrom = estados[fromId] || 'pendiente';
      const hidden = edgeMode !== 'ambos' && edge.tipo !== edgeMode;

      let color = themeConfig.graph.edgeDefault || '#1e293b';
      let width = edge.tipo === 'aprobada' ? 2.2 : 1.4;

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
      } else if (!hidden) {
        if (edge.tipo === 'regular') {
          if (estFrom === 'aprobada') color = themeConfig.graph.aprobada.border;
          else if (estFrom === 'regular') color = themeConfig.graph.cursable.border;
          else color = themeConfig.graph.edgeDefault;
        } else {
          if (estFrom === 'aprobada') color = themeConfig.graph.regular.border;
          else color = themeConfig.graph.edgeDefault;
        }
      }

      const finalColor = hidden && !dependenciesTree ? 'transparent' : color;
      const sig = `${finalColor}_${width}`;
      nextEdgeSignatures.set(edge.id, sig);

      if (prevEdgeSignaturesRef.current.get(edge.id) !== sig) {
        edgeUpdates.push({
          id: edge.id,
          color: { color: finalColor },
          width
        });
      }
    });

    if (edgeUpdates.length > 0) {
      edgesDatasetRef.current.update(edgeUpdates as VisEdge[]);
    }
    prevEdgeSignaturesRef.current = nextEdgeSignatures;
  }, [estados, edgeMode, esMateriaCursable, esMateriaRendible, themeConfig, colorMode, dependenciesTree, focusedSubjectId]);

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

      {/* Selector flotante de modo de interacción */}
      <div className="absolute top-4 right-4 z-10 flex items-center bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-color)] p-1 rounded-xl shadow-lg font-mono text-xs">
        <button
          type="button"
          onClick={() => setInteractionMode('estado')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
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
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
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

      {/* Controles flotantes */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 bg-[var(--bg-surface)]/95 backdrop-blur-md p-1.5 rounded-xl border border-[var(--border-color)] shadow-xl z-10">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Acercar vista del grafo"
          className="p-2 rounded-lg text-[var(--text-body)] hover:bg-[var(--bg-elevated)] transition-colors"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Alejar vista del grafo"
          className="p-2 rounded-lg text-[var(--text-body)] hover:bg-[var(--bg-elevated)] transition-colors"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleFit}
          aria-label="Ajustar y centrar grafo"
          className="p-2 rounded-lg text-[var(--text-body)] hover:bg-[var(--bg-elevated)] transition-colors"
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
