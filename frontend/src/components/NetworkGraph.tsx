import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import { useTracker } from '../context/TrackerContext';
import { MATERIAS_TRONCALES } from '../data/plan2023';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export const NetworkGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesDatasetRef = useRef<DataSet<any> | null>(null);
  const edgesDatasetRef = useRef<DataSet<any> | null>(null);

  // Refs estables para los handlers — evitan el problema de stale closure
  // cuando el grafo se inicializa con [] y captura las funciones del primer render
  const toggleMateriaEstadoRef = useRef<(id: number) => void>(() => {});
  const setSelectedSubjectIdRef = useRef<(id: number | null) => void>(() => {});

  const {
    estados,
    edgeMode,
    toggleMateriaEstado,
    esMateriaCursable,
    esMateriaRendible,
    setSelectedSubjectId
  } = useTracker();

  // Mantener los refs siempre actualizados ante cada render
  useEffect(() => {
    toggleMateriaEstadoRef.current = toggleMateriaEstado;
  }, [toggleMateriaEstado]);

  useEffect(() => {
    setSelectedSubjectIdRef.current = setSelectedSubjectId;
  }, [setSelectedSubjectId]);

  // Materias a mostrar en el grafo: excluir el Seminario ADUSI (id 99)
  const materiasGrafo = MATERIAS_TRONCALES.filter(m => !m.esAdusiSolo);

  // Inicializar Network una sola vez
  useEffect(() => {
    if (!containerRef.current) return;

    // Crear nodos iniciales
    const initialNodes = materiasGrafo.map(m => ({
      id: m.id,
      label: m.nombre,
      level: m.nivel,
      shape: 'box',
      borderRadius: 8,
      margin: { top: 10, bottom: 10, left: 14, right: 14 },
      color: { background: '#0d1527', border: '#1e293b' },
      font: { color: '#64748b', size: 13, face: 'IBM Plex Mono' },
      borderWidth: 1.5,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 8, x: 0, y: 3 }
    }));

    // Crear aristas iniciales
    let edgeId = 1;
    const rawEdges: any[] = [];
    materiasGrafo.forEach(m => {
      m.reqRegular.forEach(c => {
        rawEdges.push({
          id: edgeId++,
          from: c,
          to: m.id,
          tipo: 'regular',
          color: { color: '#1e293b', opacity: 0.8 },
          width: 1.4,
          arrows: { to: { enabled: true, scaleFactor: 0.45, type: 'arrow' } },
          smooth: { type: 'cubicBezier', roundness: 0.5 }
        });
      });

      if (m.reqAprobada !== 'TODAS') {
        m.reqAprobada.forEach(c => {
          rawEdges.push({
            id: edgeId++,
            from: c,
            to: m.id,
            tipo: 'aprobada',
            color: { color: '#1e293b', opacity: 0.8 },
            width: 2.2,
            arrows: { to: { enabled: true, scaleFactor: 0.5, type: 'arrow' } },
            smooth: { type: 'cubicBezier', roundness: 0.5 }
          });
        });
      }
    });

    const nodesDataSet = new DataSet(initialNodes);
    const edgesDataSet = new DataSet(rawEdges);

    nodesDatasetRef.current = nodesDataSet;
    edgesDatasetRef.current = edgesDataSet;

    const options: any = {
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

    const net = new Network(containerRef.current, { nodes: nodesDataSet, edges: edgesDataSet }, options);
    networkRef.current = net;

    // Click simple: alternar estado — usa ref para siempre tener la función actual
    net.on('click', params => {
      if (params.nodes.length > 0) {
        const clickedId = Number(params.nodes[0]);
        toggleMateriaEstadoRef.current(clickedId);
      }
    });

    // Doble click: abrir modal de detalles
    net.on('doubleClick', params => {
      if (params.nodes.length > 0) {
        const clickedId = Number(params.nodes[0]);
        setSelectedSubjectIdRef.current(clickedId);
      }
    });

    // Click derecho: abrir modal de detalles
    net.on('oncontext', params => {
      params.event.preventDefault();
      const nodeId = net.getNodeAt(params.pointer.DOM);
      if (nodeId !== undefined) {
        setSelectedSubjectIdRef.current(Number(nodeId));
      }
    });

    // Redimensionar ante cambios de ventana (sin recentrar)
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

  // Actualizar nodos y aristas cuando cambian los estados o filtros
  useEffect(() => {
    if (!nodesDatasetRef.current || !edgesDatasetRef.current) return;

    // Actualizar nodos
    const nodeUpdates: any[] = [];
    materiasGrafo.forEach(m => {
      const est = estados[m.id] || 'pendiente';
      const cursable = esMateriaCursable(m);
      const rendible = esMateriaRendible(m);

      let bg = '#0d1527';
      let border = '#1e293b';
      let fontColor = '#64748b';
      let bw = 1.5;
      let shadowColor = 'rgba(0,0,0,0.5)';
      let shadowSize = 8;

      if (est === 'aprobada') {
        bg = '#062817';
        border = '#10b981';
        fontColor = '#34d399';
        bw = 2.2;
        shadowColor = 'rgba(16,185,129,0.3)';
        shadowSize = 10;
      } else if (est === 'regular') {
        bg = '#241a02';
        border = '#f59e0b';
        fontColor = '#fbbf24';
        bw = 2.2;
        shadowColor = rendible ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.25)';
        shadowSize = rendible ? 14 : 8;
      } else if (cursable) {
        bg = '#042232';
        border = '#22d3ee';
        fontColor = '#38bdf8';
        bw = 2.2;
        shadowColor = 'rgba(34,211,238,0.55)';
        shadowSize = 14;
      }

      nodeUpdates.push({
        id: m.id,
        color: { background: bg, border },
        font: { color: fontColor, size: 13, face: 'IBM Plex Mono' },
        borderWidth: bw,
        shadow: { enabled: true, color: shadowColor, size: shadowSize, x: 0, y: 3 }
      });
    });

    nodesDatasetRef.current.update(nodeUpdates);

    // Actualizar aristas
    const edgeUpdates: any[] = [];
    edgesDatasetRef.current.forEach((edge: any) => {
      const estFrom = estados[edge.from] || 'pendiente';
      const hidden = edgeMode !== 'ambos' && edge.tipo !== edgeMode;

      let color = '#1e293b';
      const width = edge.tipo === 'aprobada' ? 2.2 : 1.4;

      if (!hidden) {
        if (edge.tipo === 'regular') {
          if (estFrom === 'aprobada') color = '#10b981';
          else if (estFrom === 'regular') color = '#22d3ee';
          else color = '#1e293b';
        } else {
          if (estFrom === 'aprobada') color = '#f59e0b';
          else color = '#1e293b';
        }
      }

      edgeUpdates.push({
        id: edge.id,
        color: { color: hidden ? 'transparent' : color },
        width
      });
    });

    edgesDatasetRef.current.update(edgeUpdates);
  }, [estados, edgeMode, esMateriaCursable, esMateriaRendible, materiasGrafo]);

  // Controles de zoom y centrado
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
    <div className="relative w-full h-[calc(100vh-125px)] bg-[#070b13] overflow-hidden">
      {/* Contenedor Canvas de Vis Network */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Controles flotantes en pantalla */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 bg-[#0b101c]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
          title="Ajustar y Centrar"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Guía rápida flotante al pie */}
      <div className="absolute bottom-5 left-5 hidden md:flex items-center gap-4 px-3.5 py-2 rounded-xl bg-[#0b101c]/85 backdrop-blur-md border border-slate-800/80 text-[11px] font-mono text-slate-400 pointer-events-none">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">Click</kbd>
          <span>Cambiar estado</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">Doble Click</kbd>
          <span>Detalles y notas</span>
        </span>
      </div>
    </div>
  );
};
