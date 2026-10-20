import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import { useTracker } from '../../context/TrackerContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowDown, 
  RotateCcw,
  X
} from 'lucide-react';
import type { Node as VisBaseNode, Edge as VisBaseEdge } from 'vis-network/standalone';
import { MATERIAS_GRAFO, buildDependenciesTree } from './graph/graphDependencies';
import { computeNodeVisualConfig, computeEdgeVisualConfig } from './graph/graphStyles';
import { GraphSearchBar } from './graph/GraphSearchBar';
import { GraphNodeInspector } from './graph/GraphNodeInspector';

interface VisNode extends VisBaseNode {
  id: number;
}

interface VisEdge extends VisBaseEdge {
  id: number;
  from: number;
  to: number;
  tipo: 'regular' | 'aprobada';
}

import {
  STORAGE_POSITIONS_KEY,
  STORAGE_FREE_MODE_KEY,
  getCanonicalGraphPositions,
  isValidPositions,
  loadSavedPositions
} from './graph/graphPositions';

export const NetworkGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesDatasetRef = useRef<DataSet<VisNode> | null>(null);
  const edgesDatasetRef = useRef<DataSet<VisEdge> | null>(null);

  const [isFreeMode, setIsFreeMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_FREE_MODE_KEY) === 'true';
  });
  const isFreeModeRef = useRef<boolean>(isFreeMode);
  useEffect(() => {
    isFreeModeRef.current = isFreeMode;
  }, [isFreeMode]);

  const [graphDirection, setGraphDirection] = useState<'UD' | 'LR'>('UD');
  const graphDirectionRef = useRef<'UD' | 'LR'>(graphDirection);
  useEffect(() => {
    graphDirectionRef.current = graphDirection;
  }, [graphDirection]);

  const toggleMateriaEstadoRef = useRef<(id: number) => void>(() => {});
  const setSelectedSubjectIdRef = useRef<(id: number | null) => void>(() => {});
  const setFocusedSubjectIdRef = useRef<(id: number | null) => void>(() => {});
  const prevNodeSignaturesRef = useRef<Map<number, string>>(new Map());
  const prevEdgeSignaturesRef = useRef<Map<number, string>>(new Map());

  const {
    estados,
    edgeMode,
    toggleMateriaEstado,
    setEstadoDirecto,
    esMateriaCursable,
    esMateriaRendible,
    setSelectedSubjectId,
    focusedSubjectId,
    setFocusedSubjectId,
    dimApproved,
    setDimApproved
  } = useTracker();

  const { themeConfig, colorMode } = useTheme();

  useEffect(() => {
    toggleMateriaEstadoRef.current = toggleMateriaEstado;
  }, [toggleMateriaEstado]);

  useEffect(() => {
    setSelectedSubjectIdRef.current = setSelectedSubjectId;
  }, [setSelectedSubjectId]);

  useEffect(() => {
    setFocusedSubjectIdRef.current = setFocusedSubjectId;
  }, [setFocusedSubjectId]);

  // Cálculo de dependencias delegado
  const dependenciesTree = useMemo(() => {
    return buildDependenciesTree(focusedSubjectId);
  }, [focusedSubjectId]);

  // Cálculo dinámico del largo de cada botón según el texto de las materias (IBM Plex Mono 13px)
  // Ancho aprox = caracteres * 8.2px + 28px padding + 4px borde
  const maxNodeWidth = useMemo(() => {
    const maxChars = Math.max(...MATERIAS_GRAFO.map(m => m.nombre.length));
    return Math.ceil(maxChars * 8.2 + 32); // ~172px para "Gestión Gerencial"
  }, []);

  const nodeHeight = 38;

  // Separación calculada para garantizar holgura visual óptima (espacio libre real entre tarjetas)
  const HORIZONTAL_GAP = 55; // Píxeles de espacio libre garantizados entre materias del mismo año en horizontal
  const VERTICAL_GAP = 34;   // Píxeles de espacio libre vertical garantizados

  const spacingConfig = useMemo(() => {
    return {
      UD: {
        // En modo vertical: materias del mismo año van en fila horizontal
        // nodeSpacing = ancho de tarjeta + margen horizontal libre
        nodeSpacing: maxNodeWidth + HORIZONTAL_GAP, // ~227px
        levelSeparation: 155, // separación vertical entre años (conservada a gusto del usuario)
        treeSpacing: maxNodeWidth + HORIZONTAL_GAP + 15 // ~242px
      },
      LR: {
        // En modo horizontal: materias del mismo año van en columna vertical
        // nodeSpacing = alto de tarjeta + margen vertical libre
        nodeSpacing: nodeHeight + VERTICAL_GAP, // ~72px
        levelSeparation: maxNodeWidth + 95, // ~267px (separación horizontal entre columnas de años)
        treeSpacing: 180
      }
    };
  }, [maxNodeWidth]);

  const getNodeVisualConfig = useCallback((m: (typeof MATERIAS_GRAFO)[0]) => {
    const cursable = esMateriaCursable(m);
    const rendible = esMateriaRendible(m);
    return computeNodeVisualConfig(
      m,
      estados,
      cursable,
      rendible,
      dependenciesTree,
      focusedSubjectId,
      themeConfig,
      colorMode,
      false,
      dimApproved
    );
  }, [estados, esMateriaCursable, esMateriaRendible, dependenciesTree, focusedSubjectId, themeConfig, colorMode, dimApproved]);

  const getEdgeVisualConfig = useCallback((fromId: number, toId: number, tipo: 'regular' | 'aprobada') => {
    return computeEdgeVisualConfig(
      fromId,
      toId,
      tipo,
      estados,
      edgeMode,
      dependenciesTree,
      focusedSubjectId,
      themeConfig,
      colorMode,
      false,
      dimApproved
    );
  }, [estados, edgeMode, dependenciesTree, focusedSubjectId, themeConfig, colorMode, dimApproved]);

  // Inicializar vis-network
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
        shadow: { enabled: cfg.shadowSize > 0, color: cfg.shadowColor, size: cfg.shadowSize, x: 0, y: 3 },
        physics: false
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
          smooth: { enabled: true, type: 'cubicBezier', roundness: 0.5 },
          physics: false
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
            smooth: { enabled: true, type: 'cubicBezier', roundness: 0.5 },
            physics: false
          });
        });
      }
    });

    const nodesDataSet = new DataSet<VisNode>(initialNodes);
    const edgesDataSet = new DataSet<VisEdge>(rawEdges);

    nodesDatasetRef.current = nodesDataSet;
    edgesDatasetRef.current = edgesDataSet;

    const spacing = graphDirection === 'LR' ? spacingConfig.LR : spacingConfig.UD;

    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          direction: graphDirection,
          levelSeparation: spacing.levelSeparation,
          nodeSpacing: spacing.nodeSpacing,
          treeSpacing: spacing.treeSpacing,
          blockShifting: true,
          edgeMinimization: false,
          parentCentralization: true,
          sortMethod: 'directed'
        }
      },
      physics: {
        enabled: false,
        stabilization: false
      },
      interaction: {
        selectConnectedEdges: false,
        hover: true,
        tooltipDelay: 99999,
        zoomView: true,
        dragView: true,
        dragNodes: isFreeMode
      },
      nodes: {
        chosen: false,
        physics: false
      },
      edges: {
        chosen: false,
        physics: false
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const net = new Network(containerRef.current, { nodes: nodesDataSet, edges: edgesDataSet }, options as any);
    networkRef.current = net;

    let isDraggingNode = false;

    // Detectar arrastre para evitar que soltar un nodo dispare el evento click
    net.on('dragStart', params => {
      if (params.nodes && params.nodes.length > 0) {
        isDraggingNode = true;
      }
    });

    net.on('dragEnd', params => {
      if (isDraggingNode) {
        setTimeout(() => {
          isDraggingNode = false;
        }, 80);
      }

      if (isFreeModeRef.current && params.nodes && params.nodes.length > 0) {
        // En Modo Libre: guardar posiciones personalizadas en cualquier coordenada 2D
        const positions = net.getPositions();
        if (isValidPositions(positions)) {
          try {
            localStorage.setItem(STORAGE_POSITIONS_KEY, JSON.stringify(positions));
          } catch {
            // Ignorar
          }
        }
      }
    });

    // Click simple en una materia: alternar estado directamente (Pendiente -> Regular -> Aprobada -> Pendiente)
    net.on('click', params => {
      if (isDraggingNode) return;

      if (params.nodes && params.nodes.length > 0) {
        const clickedId = Number(params.nodes[0]);
        toggleMateriaEstadoRef.current(clickedId);
      } else {
        // Clic en el fondo vacío: limpia el foco / cadena crítica de búsqueda
        setFocusedSubjectIdRef.current(null);
      }
    });

    // Clic derecho en una materia: abrir la ficha modal completa (SubjectModal)
    net.on('oncontext', params => {
      params.event.preventDefault();
      const nodeId = net.getNodeAt(params.pointer.DOM);
      if (nodeId !== undefined) {
        setSelectedSubjectIdRef.current(Number(nodeId));
      }
    });

    net.once('afterDrawing', () => {
      net.redraw();

      // Si el componente monta con Modo Libre activo, transicionar de forma transparente
      // fijando las coordenadas jerárquicas en el dataset y liberando el eje Y para arrastre 2D
      if (isFreeModeRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (net as any)?.physics?.stopSimulation?.();
        const currentPos = net.getPositions();
        const saved = loadSavedPositions();
        const posToUse = (saved && isValidPositions(saved, graphDirectionRef.current))
          ? saved
          : currentPos;

        if (nodesDatasetRef.current) {
          const updates = MATERIAS_GRAFO.map(m => {
            const p = posToUse[m.id] || currentPos[m.id];
            return {
              id: m.id,
              x: p ? p.x : undefined,
              y: p ? p.y : undefined,
              physics: false
            };
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nodesDatasetRef.current.update(updates as any);
        }

        net.setOptions({
          layout: { hierarchical: { enabled: false } },
          physics: { enabled: false, stabilization: false },
          nodes: { physics: false },
          edges: { physics: false },
          interaction: {
            dragNodes: true,
            dragView: true
          }
        });
      }
    });

    const initialRedrawTimer = setTimeout(() => {
      net.redraw();
    }, 80);

    const handleResize = () => {
      net.redraw();
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        net.redraw();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(initialRedrawTimer);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      net.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar nodos y aristas cuando cambian estados o temas
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
          font: { color: cfg.fontColor },
          borderWidth: cfg.bw,
          shadow: { enabled: cfg.shadowSize > 0, color: cfg.shadowColor, size: cfg.shadowSize, x: 0, y: 3 }
        });
      }
    });

    if (nodeUpdates.length > 0) {
      nodesDatasetRef.current.update(nodeUpdates);
      prevNodeSignaturesRef.current = nextNodeSignatures;
    }

    const edgeUpdates: Partial<VisEdge>[] = [];
    const nextEdgeSignatures = new Map<number, string>();

    edgesDatasetRef.current.forEach((edge: VisEdge) => {
      const cfg = getEdgeVisualConfig(edge.from, edge.to, edge.tipo);
      nextEdgeSignatures.set(edge.id, cfg.sig);

      if (prevEdgeSignaturesRef.current.get(edge.id) !== cfg.sig) {
        edgeUpdates.push({
          id: edge.id,
          color: { color: cfg.color, opacity: 0.8 },
          width: cfg.width
        });
      }
    });

    if (edgeUpdates.length > 0) {
      edgesDatasetRef.current.update(edgeUpdates);
      prevEdgeSignaturesRef.current = nextEdgeSignatures;
    }
  }, [getNodeVisualConfig, getEdgeVisualConfig]);

  // Controles de cámara
  const handleZoomIn = () => {
    if (!networkRef.current) return;
    const currentScale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: currentScale * 1.25, animation: { duration: 250, easingFunction: 'easeInOutQuad' } });
  };

  const handleZoomOut = () => {
    if (!networkRef.current) return;
    const currentScale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: currentScale * 0.8, animation: { duration: 250, easingFunction: 'easeInOutQuad' } });
  };

  const handleFit = () => {
    if (!networkRef.current) return;
    networkRef.current.fit({ animation: { duration: 350, easingFunction: 'easeInOutQuad' } });
  };

  // Alternar dirección de visualización (Horizontal 'LR' vs Vertical 'UD')
  const handleToggleDirection = () => {
    const nextDir = graphDirection === 'UD' ? 'LR' : 'UD';
    setGraphDirection(nextDir);
    if (!networkRef.current) return;

    if (!isFreeMode) {
      const spacing = nextDir === 'LR' ? spacingConfig.LR : spacingConfig.UD;
      networkRef.current.setOptions({
        layout: {
          hierarchical: {
            enabled: true,
            direction: nextDir,
            levelSeparation: spacing.levelSeparation,
            nodeSpacing: spacing.nodeSpacing,
            treeSpacing: spacing.treeSpacing,
            blockShifting: true,
            edgeMinimization: false,
            parentCentralization: true,
            sortMethod: 'directed'
          }
        },
        physics: false,
        interaction: {
          dragNodes: false,
          dragView: true
        }
      });
      networkRef.current.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
    }
  };

  // Alternar entre Modo Jerárquico y Modo Libre (arrastre manual con guardado)
  const handleToggleFreeMode = () => {
    const nextMode = !isFreeMode;
    setIsFreeMode(nextMode);
    try {
      localStorage.setItem(STORAGE_FREE_MODE_KEY, String(nextMode));
    } catch {
      // Ignorar
    }

    if (!networkRef.current || !nodesDatasetRef.current) return;

    if (nextMode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (networkRef.current as any)?.physics?.stopSimulation?.();

      // 1. Obtener posiciones actuales si son válidas, o el layout canónico limpio
      const currentPos = networkRef.current.getPositions();
      const saved = loadSavedPositions();
      const canonical = getCanonicalGraphPositions(graphDirection);
      const posToUse = (saved && isValidPositions(saved))
        ? saved
        : (isValidPositions(currentPos) ? currentPos : canonical);

      // 2. Fijar { x, y } y physics: false para cada materia de forma que no salten ni se amontonen
      const nodeUpdates = MATERIAS_GRAFO.map(m => {
        const p = posToUse[m.id] || canonical[m.id];
        return {
          id: m.id,
          x: p.x,
          y: p.y,
          physics: false
        };
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodesDatasetRef.current.update(nodeUpdates as any);

      // 3. Desactivar layout jerárquico y física completamente, y habilitar arrastre libre individual de materias
      networkRef.current.setOptions({
        layout: { hierarchical: { enabled: false } },
        physics: { enabled: false, stabilization: false },
        nodes: { physics: false },
        edges: { physics: false },
        interaction: {
          dragNodes: true,
          dragView: true
        }
      });

      try {
        localStorage.setItem(STORAGE_POSITIONS_KEY, JSON.stringify(posToUse));
      } catch {
        // Ignorar
      }
      networkRef.current.fit({ animation: { duration: 350, easingFunction: 'easeInOutQuad' } });
    } else {
      // Volver a Modo Jerárquico canónico
      const resetCoords = MATERIAS_GRAFO.map(m => ({
        id: m.id,
        x: undefined,
        y: undefined,
        physics: false
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodesDatasetRef.current.update(resetCoords as any);

      const spacing = graphDirection === 'LR' ? spacingConfig.LR : spacingConfig.UD;

      networkRef.current.setOptions({
        layout: {
          hierarchical: {
            enabled: true,
            direction: graphDirection,
            levelSeparation: spacing.levelSeparation,
            nodeSpacing: spacing.nodeSpacing,
            treeSpacing: spacing.treeSpacing,
            blockShifting: true,
            edgeMinimization: false,
            parentCentralization: true,
            sortMethod: 'directed'
          }
        },
        physics: { enabled: false, stabilization: false },
        nodes: { physics: false },
        edges: { physics: false },
        interaction: {
          dragNodes: false,
          dragView: true
        }
      });
      networkRef.current.fit({ animation: { duration: 350, easingFunction: 'easeInOutQuad' } });
    }
  };

  // Reiniciar disposición y zoom a coordenadas canónicas espaciadas
  const handleResetLayout = () => {
    try {
      localStorage.removeItem('tracker_graph_positions');
      localStorage.removeItem(STORAGE_POSITIONS_KEY);
      localStorage.setItem(STORAGE_FREE_MODE_KEY, 'false');
    } catch {
      // Ignorar
    }
    setIsFreeMode(false);

    if (!networkRef.current || !nodesDatasetRef.current) return;

    const resetNodes = MATERIAS_GRAFO.map(m => ({
      id: m.id,
      x: undefined,
      y: undefined,
      physics: false
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodesDatasetRef.current.update(resetNodes as any);

    const spacing = graphDirection === 'LR' ? spacingConfig.LR : spacingConfig.UD;

    networkRef.current.setOptions({
      layout: {
        hierarchical: {
          enabled: true,
          direction: graphDirection,
          levelSeparation: spacing.levelSeparation,
          nodeSpacing: spacing.nodeSpacing,
          treeSpacing: spacing.treeSpacing,
          blockShifting: true,
          edgeMinimization: false,
          parentCentralization: true,
          sortMethod: 'directed'
        }
      },
      physics: { enabled: false, stabilization: false },
      nodes: { physics: false },
      edges: { physics: false },
      interaction: {
        dragNodes: false,
        dragView: true
      }
    });
    networkRef.current.fit({ animation: { duration: 450, easingFunction: 'easeInOutQuad' } });
  };

  // Foco animado al buscar una materia
  const handleSearchFocus = (materiaId: number) => {
    setFocusedSubjectId(materiaId);
    if (networkRef.current) {
      networkRef.current.focus(materiaId, {
        scale: 1.2,
        animation: { duration: 550, easingFunction: 'easeInOutQuad' }
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-(--bg-base) overflow-hidden select-none">
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
        tabIndex={0}
        aria-label="Grafo interactivo de correlatividades. Usa las flechas para explorar y Enter para interactuar."
      />

      {/* Barra de Búsqueda Flotante */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
        <GraphSearchBar
          onSelectSubject={handleSearchFocus}
          estados={estados}
        />
      </div>

      {/* Banner flotante de Materia Enfocada */}
      {focusedSubjectId && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 md:top-4 z-20 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-(--bg-surface)/95 backdrop-blur-md border border-(--border-color) shadow-2xl py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl font-mono text-xs animate-in fade-in slide-in-from-top-3 max-w-[95vw]">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-(--color-primary)">
              {MATERIAS_GRAFO.find(m => m.id === focusedSubjectId)?.nombre}
            </span>
          </div>

          <div className="flex items-center gap-2 border-l border-(--border-color) pl-2 sm:pl-3 text-[11px]">
            {/* Materias previas */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Correlativas:</span>
              <span 
                className="px-2 py-0.5 rounded font-semibold border"
                style={{
                  backgroundColor: 'var(--color-regular-bg)',
                  borderColor: 'var(--color-regular-border)',
                  color: 'var(--color-regular)'
                }}
                title="Correlativas previas requeridas con regularidad"
              >
                {dependenciesTree?.ancestorsRegular.size || 0} regular
              </span>
              <span 
                className="px-2 py-0.5 rounded font-semibold border"
                style={{
                  backgroundColor: 'var(--color-aprobada-bg)',
                  borderColor: 'var(--color-aprobada-border)',
                  color: 'var(--color-aprobada)'
                }}
                title="Correlativas previas requeridas con examen final aprobado"
              >
                {dependenciesTree?.ancestorsAprobada.size || 0} aprobada
              </span>
            </div>

            <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>

            {/* Materias posteriores */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Posteriores:</span>
              <span 
                className="px-2 py-0.5 rounded font-semibold border"
                style={{
                  backgroundColor: 'var(--color-regular-bg)',
                  borderColor: 'var(--color-regular-border)',
                  color: 'var(--color-regular)'
                }}
                title="Materias posteriores que destraba con regularidad"
              >
                {dependenciesTree?.descendantsRegular.size || 0} regular
              </span>
              <span 
                className="px-2 py-0.5 rounded font-semibold border"
                style={{
                  backgroundColor: 'var(--color-aprobada-bg)',
                  borderColor: 'var(--color-aprobada-border)',
                  color: 'var(--color-aprobada)'
                }}
                title="Materias posteriores que destraba con examen final aprobado"
              >
                {dependenciesTree?.descendantsAprobada.size || 0} aprobada
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-1 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedSubjectId(focusedSubjectId)}
              className="px-2 py-0.5 rounded bg-(--bg-elevated) hover:bg-(--border-color) text-cyan-700 dark:text-cyan-300 text-[11px] transition-colors border border-(--border-color) cursor-pointer"
            >
              Ficha
            </button>
            <button
              type="button"
              onClick={() => setFocusedSubjectId(null)}
              className="p-1 rounded text-slate-400 hover:text-(--text-body) hover:bg-(--bg-elevated) transition-colors cursor-pointer"
              title="Restablecer vista completa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Controles flotantes superiores derechos: Orientación, Modo Libre & Atenuar Aprobadas */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex items-center gap-1.5 bg-(--bg-surface)/90 backdrop-blur-md border border-(--border-color) p-1 rounded-xl shadow-lg font-mono text-xs">
        {/* Toggle Orientación: Horizontal (LR) vs Vertical (UD) en modo jerárquico */}
        {!isFreeMode && (
          <button
            type="button"
            onClick={handleToggleDirection}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors min-h-8.5 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold hover:text-(--text-body) ${
              graphDirection === 'LR' ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 font-bold' : ''
            }`}
            title={`Orientación actual: ${graphDirection === 'UD' ? 'Vertical (Arriba-Abajo)' : 'Horizontal (Izquierda-Derecha)'}. Clic para alternar.`}
          >
            {graphDirection === 'UD' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{graphDirection === 'UD' ? 'Vertical' : 'Horizontal'}</span>
          </button>
        )}

        {/* Interruptor Switch de Modo Libre */}
        <button
          type="button"
          role="switch"
          aria-checked={isFreeMode}
          aria-label="Interruptor de Modo Libre"
          onClick={handleToggleFreeMode}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
            isFreeMode
              ? 'bg-purple-500/15 border-purple-500/40'
              : 'border-transparent hover:bg-(--bg-elevated)'
          }`}
          title={isFreeMode ? 'Modo Libre activo: arrastrá las materias libremente a cualquier posición 2D (se guarda tu orden)' : 'Modo Jerárquico activo: las materias rebotan y mantienen su estructura ordenada por niveles. Clic para activar Modo Libre.'}
        >
          <span className="text-[11px] font-semibold text-(--text-body) hidden sm:inline">
            Modo Libre
          </span>
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isFreeMode ? 'bg-purple-600 dark:bg-purple-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isFreeMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </span>
        </button>

        {/* Toggle Atenuar Aprobadas */}
        <button
          type="button"
          onClick={() => setDimApproved(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors min-h-8.5 cursor-pointer ${
            dimApproved
              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
              : 'text-slate-700 dark:text-slate-300 font-semibold hover:text-(--text-body)'
          }`}
          title="Atenuar materias ya aprobadas para concentrarse en las materias pendientes y regulares"
        >
          {dimApproved ? <EyeOff className="w-3.5 h-3.5 text-emerald-500" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Atenuar Aprobadas</span>
        </button>
      </div>

      {/* Inspector de Nodo Flotante (Mini-HUD en esquina) */}
      <GraphNodeInspector
        focusedSubjectId={focusedSubjectId}
        estados={estados}
        onClose={() => setFocusedSubjectId(null)}
        onOpenDetails={(id) => setSelectedSubjectId(id)}
        onSetEstadoDirecto={(id, est) => setEstadoDirecto(id, est)}
      />

      {/* Controles flotantes de Zoom y Reset Layout */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex flex-col gap-1.5 bg-(--bg-surface) p-1.5 rounded-2xl border-2 border-(--border-color) shadow-2xl z-20">
        <button
          type="button"
          onClick={handleResetLayout}
          aria-label="Restablecer disposición del grafo"
          className="p-2.5 rounded-lg text-(--text-body) hover:bg-(--bg-elevated) transition-colors min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
          title="Restablecer Disposición / Layout"
        >
          <RotateCcw className="w-4 h-4 text-(--color-primary)" />
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Acercar vista del grafo"
          className="p-2.5 rounded-lg text-(--text-body) hover:bg-(--bg-elevated) transition-colors min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Alejar vista del grafo"
          className="p-2.5 rounded-lg text-(--text-body) hover:bg-(--bg-elevated) transition-colors min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleFit}
          aria-label="Ajustar y centrar grafo"
          className="p-2.5 rounded-lg text-(--text-body) hover:bg-(--bg-elevated) transition-colors min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
          title="Ajustar y Centrar"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Guía rápida flotante (solo cuando no hay materia enfocada) */}
      {!focusedSubjectId && (
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 hidden md:flex items-center gap-4 px-3.5 py-2 rounded-2xl bg-(--bg-surface) border-2 border-(--border-color) text-[11px] font-mono text-slate-800 dark:text-slate-200 pointer-events-none shadow-xl font-medium">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-(--text-body) font-bold">Click</kbd>
            <span>Cambiar estado</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-(--text-body) font-bold">Buscar</kbd>
            <span>Cadena crítica y foco</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-(--text-body) font-bold">Click Derecho</kbd>
            <span>Ficha de materia</span>
          </span>
          <div className="flex items-center gap-2.5 border-l border-(--border-color) pl-3">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-regular)' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-regular)' }} />
              <span>Regularidad</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-aprobada)' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-aprobada)' }} />
              <span>Aprobación</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
