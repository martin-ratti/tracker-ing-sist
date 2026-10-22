import React, { useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { MATERIAS_TRONCALES, MATERIAS_MAP } from '../../data/plan2023';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Award
} from 'lucide-react';
import { formatPromedio } from '../../utils/formatters';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { stats, estados, estadosElectivas, notas } = useTracker();
  const { isMounted, isVisible } = useModalAnimation(isOpen, 200);
  const modalRef = useFocusTrap(isOpen);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const {
    aprobadasCount,
    regularesCount,
    cursablesCount,
    totalTroncales,
    promedio,
    horasElectivasAprobadas
  } = stats;

  const pendientesCount = totalTroncales - aprobadasCount - regularesCount - cursablesCount;

  const pApr = totalTroncales > 0 ? (aprobadasCount / totalTroncales) * 100 : 0;
  const pReg = totalTroncales > 0 ? (regularesCount / totalTroncales) * 100 : 0;
  const pCur = totalTroncales > 0 ? (cursablesCount / totalTroncales) * 100 : 0;

  const conicGradient = `conic-gradient(
    var(--color-aprobada) 0% ${pApr}%,
    var(--color-regular) ${pApr}% ${pApr + pReg}%,
    var(--color-cursable) ${pApr + pReg}% ${pApr + pReg + pCur}%,
    var(--bg-elevated) ${pApr + pReg + pCur}% 100%
  )`;

  const nivelesProgress = useMemo(() => {
    const levels = [1, 2, 3, 4, 5];
    return levels.map(nivel => {
      const materiasNivel = MATERIAS_TRONCALES.filter(m => m.nivel === nivel && !m.esAdusiSolo);
      const total = materiasNivel.length;
      const aprobadas = materiasNivel.filter(m => estados[m.id] === 'aprobada').length;
      const porcentaje = total > 0 ? (aprobadas / total) * 100 : 0;
      return { nivel, total, aprobadas, porcentaje };
    });
  }, [estados]);

  const calificacionesList = useMemo(() => {
    const entries = [];
    for (const [idStr, notaData] of Object.entries(notas)) {
      const id = Number(idStr);
      const isAprobada = estados[id] === 'aprobada' || estadosElectivas[id] === 'aprobada';
      if (isAprobada && notaData && typeof notaData.nota === 'number') {
        const materia = MATERIAS_MAP[id];
        if (materia) {
          entries.push({
            id,
            nombre: materia.nombre,
            nota: notaData.nota,
            nivel: materia.nivel
          });
        }
      }
    }
    return entries.sort((a, b) => a.id - b.id);
  }, [notas, estados, estadosElectivas]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 no-scrollbar">
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className={`relative z-10 w-full max-w-3xl 2xl:max-w-4xl 4k:max-w-5xl max-h-[92vh] sm:max-h-[90vh] bg-(--bg-surface) border border-(--border-color) rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto transform transition-all duration-200 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-(--border-color) bg-(--bg-elevated) shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            </div>
            <h2 id="stats-title" className="font-syne font-bold text-base sm:text-lg text-(--text-body)">
              Dashboard de Estadísticas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-(--text-body) hover:bg-(--bg-surface) active:scale-90 rounded-xl transition-all min-w-9 min-h-9 flex items-center justify-center shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-6 sm:space-y-8 no-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de distribución */}
            <div className="bg-(--bg-elevated) p-5 rounded-xl border border-(--border-color) flex flex-col items-center">
              <h3 className="font-syne text-sm font-semibold text-(--text-body) mb-6 w-full flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Distribución por Estado
              </h3>
              
              <div className="relative w-48 h-48 rounded-full mb-6" style={{ background: conicGradient }}>
                <div className="absolute inset-2 bg-(--bg-elevated) rounded-full flex flex-col items-center justify-center">
                  <span className="font-syne text-2xl font-bold text-(--text-body)">
                    {Math.round(pApr)}%
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Completado</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-aprobada)' }}></span>
                  <span className="text-(--text-body)">Aprobadas ({aprobadasCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-regular)' }}></span>
                  <span className="text-(--text-body)">Regulares ({regularesCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-cursable)' }}></span>
                  <span className="text-(--text-body)">Cursables ({cursablesCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-(--bg-surface) border border-(--border-color)"></span>
                  <span className="text-(--text-body)">Bloqueadas ({pendientesCount})</span>
                </div>
              </div>
            </div>

            {/* Promedios y Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-(--bg-elevated) p-4 rounded-xl border border-(--border-color) flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-mono uppercase">Promedio Académico</span>
                </div>
                <span className="font-syne text-2xl font-bold text-purple-400">
                  {formatPromedio(promedio)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">Materias aprobadas</span>
              </div>

              <div className="bg-(--bg-elevated) p-4 rounded-xl border border-(--border-color) flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono uppercase">Avance Troncales</span>
                </div>
                <span className="font-syne text-2xl font-bold text-emerald-400">
                  {aprobadasCount}<span className="text-sm text-slate-500">/{totalTroncales}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">{stats.porcentajeCarrera}% de la carrera</span>
              </div>

              <div className="bg-(--bg-elevated) p-4 rounded-xl border border-(--border-color) flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono uppercase">Horas Electivas</span>
                </div>
                <span className="font-syne text-2xl font-bold text-amber-400 whitespace-nowrap">
                  {horasElectivasAprobadas}<span className="text-sm text-slate-500"> hs</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">Total acumulado</span>
              </div>
            </div>
          </div>

          {/* Progreso por Nivel */}
          <div className="bg-(--bg-elevated) p-5 rounded-xl border border-(--border-color)">
            <h3 className="font-syne text-sm font-semibold text-(--text-body) mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progreso por Nivel
            </h3>
            <div className="space-y-4">
              {nivelesProgress.map(np => (
                <div key={np.nivel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-(--text-body) font-bold">{np.nivel}º Año</span>
                    <span className="text-slate-500 dark:text-slate-400">{np.aprobadas} / {np.total} aprobadas</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-(--border-color)">
                    <div 
                      className="h-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${np.porcentaje}%`,
                        background: 'var(--gradient-primary)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calificaciones de Materias Aprobadas */}
          <div className="bg-(--bg-elevated) p-5 rounded-xl border border-(--border-color)">
            <h3 className="font-syne text-sm font-semibold text-(--text-body) mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Calificaciones de Materias Aprobadas
            </h3>
            
            {calificacionesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 font-mono text-xs">
                {calificacionesList.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-(--bg-surface) border border-(--border-color) p-2.5 rounded-lg flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-(--text-body) truncate" title={item.nombre}>
                        {item.nombre}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.nivel}º Año · #{String(item.id).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="shrink-0 font-syne font-black text-sm px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                      {item.nota}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 font-mono text-sm border border-dashed border-(--border-color) rounded-lg">
                No hay notas registradas. Podés cargar la nota de cada materia al marcarla como aprobada.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
