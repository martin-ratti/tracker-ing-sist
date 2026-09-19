import React, { useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { MATERIAS_TRONCALES, MATERIAS_MAP } from '../data/plan2023';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Calendar 
} from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { stats, estados, notas } = useTracker();
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
    promedioConAplazos,
    promedioSinAplazos,
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

  const timeline = useMemo(() => {
    const entries = [];
    for (const [idStr, notaData] of Object.entries(notas)) {
      if (notaData && notaData.fecha) {
        const id = Number(idStr);
        const materia = MATERIAS_MAP[id];
        if (materia) {
          entries.push({
            id,
            nombre: materia.nombre,
            nota: notaData.nota,
            fechaStr: notaData.fecha,
            dateObj: new Date(notaData.fecha)
          });
        }
      }
    }
    return entries.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [notas]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            </div>
            <h2 id="stats-title" className="font-syne font-bold text-lg text-[var(--text-body)]">
              Dashboard de Estadísticas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de distribución */}
            <div className="bg-[var(--bg-elevated)] p-5 rounded-xl border border-[var(--border-color)] flex flex-col items-center">
              <h3 className="font-syne text-sm font-semibold text-[var(--text-body)] mb-6 w-full flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Distribución por Estado
              </h3>
              
              <div className="relative w-48 h-48 rounded-full mb-6" style={{ background: conicGradient }}>
                <div className="absolute inset-2 bg-[var(--bg-elevated)] rounded-full flex flex-col items-center justify-center">
                  <span className="font-syne text-2xl font-bold text-[var(--text-body)]">
                    {Math.round(pApr)}%
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Completado</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-aprobada)' }}></span>
                  <span className="text-[var(--text-body)]">Aprobadas ({aprobadasCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-regular)' }}></span>
                  <span className="text-[var(--text-body)]">Regulares ({regularesCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-cursable)' }}></span>
                  <span className="text-[var(--text-body)]">Cursables ({cursablesCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)]"></span>
                  <span className="text-[var(--text-body)]">Bloqueadas ({pendientesCount})</span>
                </div>
              </div>
            </div>

            {/* Promedios y Métricas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-color)] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase">Promedio c/Aplazos</span>
                </div>
                <span className="font-syne text-2xl font-bold text-[var(--text-body)]">
                  {promedioConAplazos !== null ? promedioConAplazos.toFixed(2) : '—'}
                </span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-color)] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-mono uppercase">Promedio s/Aplazos</span>
                </div>
                <span className="font-syne text-2xl font-bold text-purple-400">
                  {promedioSinAplazos !== null ? promedioSinAplazos.toFixed(2) : '—'}
                </span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-color)] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono uppercase">Avance Troncales</span>
                </div>
                <span className="font-syne text-2xl font-bold text-emerald-400">
                  {aprobadasCount}<span className="text-sm text-slate-500">/{totalTroncales}</span>
                </span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-color)] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono uppercase">Horas Electivas</span>
                </div>
                <span className="font-syne text-2xl font-bold text-amber-400">
                  {horasElectivasAprobadas}<span className="text-sm text-slate-500"> hs</span>
                </span>
              </div>
            </div>
          </div>

          {/* Progreso por Nivel */}
          <div className="bg-[var(--bg-elevated)] p-5 rounded-xl border border-[var(--border-color)]">
            <h3 className="font-syne text-sm font-semibold text-[var(--text-body)] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progreso por Nivel
            </h3>
            <div className="space-y-4">
              {nivelesProgress.map(np => (
                <div key={np.nivel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--text-body)] font-bold">{np.nivel}º Año</span>
                    <span className="text-slate-500 dark:text-slate-400">{np.aprobadas} / {np.total} aprobadas</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--border-color)]">
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

          {/* Timeline de Aprobaciones */}
          <div className="bg-[var(--bg-elevated)] p-5 rounded-xl border border-[var(--border-color)]">
            <h3 className="font-syne text-sm font-semibold text-[var(--text-body)] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline de Aprobaciones
            </h3>
            
            {timeline.length > 0 ? (
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[var(--border-color)]">
                {timeline.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    {/* Icono / Marker */}
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-[var(--bg-elevated)] bg-emerald-500 text-white shrink-0 md:order-1 md:group-odd:-ml-2.5 md:group-even:-mr-2.5 shadow-sm z-10 absolute left-0 md:left-1/2 md:-translate-x-1/2">
                    </div>
                    
                    {/* Tarjeta */}
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-lg flex items-center justify-between ml-8 md:ml-0 shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="font-mono text-xs font-bold text-[var(--text-body)] truncate" title={item.nombre}>{item.nombre}</span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{item.fechaStr}</span>
                      </div>
                      {item.nota !== undefined && (
                        <div className="ml-3 shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] font-syne font-bold text-xs text-[var(--text-body)]">
                          {item.nota}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 font-mono text-sm border border-dashed border-[var(--border-color)] rounded-lg">
                No hay registros con fecha asignada.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
