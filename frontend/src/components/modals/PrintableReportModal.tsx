import React, { useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS, MATERIAS_MAP } from '../../data/plan2023';
import { 
  X, 
  Download, 
  FileText, 
  User, 
  Sparkles
} from 'lucide-react';
import { formatPromedio } from '../../utils/formatters';
import { exportFichaCurricularPDF } from '../../utils/pdfExporter';

export const PrintableReportModal: React.FC = () => {
  const { 
    reportOpen, 
    setReportOpen, 
    setProfileModalOpen,
    perfil, 
    estados, 
    estadosElectivas, 
    notas, 
    ppsHoras, 
    stats,
    metasExamen
  } = useTracker();

  const [isDownloading, setIsDownloading] = React.useState(false);

  const { isMounted, isVisible } = useModalAnimation(reportOpen, 200);
  const modalRef = useFocusTrap(reportOpen);

  useEffect(() => {
    if (!reportOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReportOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [reportOpen, setReportOpen]);

  if (!isMounted) return null;

  const handleDownloadPDF = () => {
    try {
      setIsDownloading(true);
      exportFichaCurricularPDF({
        perfil,
        estados,
        estadosElectivas,
        notas,
        ppsHoras,
        stats,
        metasExamen
      });
    } catch (err) {
      console.error('Error al generar la ficha curricular en PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const fechaEmision = `${day}/${month}/${year}, ${hours}:${minutes} hs`;

  const niveles = [1, 2, 3, 4, 5];
  const electivasAprobadas = MATERIAS_ELECTIVAS.filter(e => estadosElectivas[e.id] === 'aprobada');
  const metasArray = Object.values(metasExamen);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2.5 sm:p-4 no-scrollbar print:p-0 print:static print:overflow-visible print:block">
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm print:hidden transition-opacity duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setReportOpen(false)}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className={`relative z-10 bg-(--bg-surface) border border-(--border-color) rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl my-auto print:border-none print:shadow-none print:max-w-none print:max-h-none print:h-auto print:rounded-none print:bg-white print:text-black print:overflow-visible print:static print:block transform transition-all duration-200 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* Barra de Acciones (oculta al imprimir) */}
        <div className="p-3.5 sm:p-4 border-b border-(--border-color) bg-(--bg-elevated) flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2 rounded-xl border shrink-0"
              style={{
                backgroundColor: 'var(--color-primary-bg)',
                borderColor: 'var(--color-primary-border)',
                color: 'var(--color-primary)'
              }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-xs sm:text-base font-bold font-syne text-(--text-body)">
                Ficha Curricular y Analítico
              </h2>
              <p className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Plan 2023 · UTN Facultad Regional Rosario
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--bg-surface) hover:bg-(--border-color)/40 active:scale-95 text-(--text-body) border border-(--border-color) font-mono text-xs transition-all"
              title="Editar nombre y legajo"
            >
              <User className="w-3.5 h-3.5" />
              <span>Editar Alumno</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-(--color-primary) hover:opacity-90 active:scale-95 text-slate-950 font-mono text-xs font-bold transition-all shadow-lg cursor-pointer disabled:opacity-60"
              title="Descargar ficha curricular analítica completa en PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generando...' : 'Descargar PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setReportOpen(false)}
              aria-label="Cerrar reporte"
              className="p-1.5 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--border-color)/40 active:scale-90 transition-all min-w-9 min-h-9 flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENEDOR DE LA FICHA IMPRIMIBLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-(--text-body) no-scrollbar print:overflow-visible print:p-0 print:text-black bg-(--bg-base) print:bg-white print:h-auto print:static print:block">
          
          {/* Encabezado Institucional */}
          <div className="border-b-2 border-(--border-color) print:border-black pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Emblema UTN */}
              <div className="w-12 h-12 rounded-xl bg-(--bg-elevated) border border-(--border-color) print:border-black flex flex-col items-center justify-center text-center font-syne font-black text-(--color-primary) print:text-black">
                <span className="text-xs leading-none">UTN</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 print:text-black tracking-widest">FRRo</span>
              </div>
              <div>
                <h1 className="font-syne font-black text-base sm:text-lg text-(--text-body) print:text-black tracking-wide leading-tight">
                  UNIVERSIDAD TECNOLÓGICA NACIONAL
                </h1>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 print:text-neutral-700 font-semibold">
                  Facultad Regional Rosario · Dpto. Ingeniería en Sistemas de Información
                </p>
                <p className="text-[11px] font-mono text-(--color-primary) print:text-neutral-600">
                  Plan de Estudio 2023 · Estado de Correlatividades y Calificaciones
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-[11px] text-slate-500 dark:text-slate-400 print:text-neutral-600 shrink-0">
              <div>Fecha de Emisión:</div>
              <div className="font-bold text-(--text-body) print:text-black whitespace-nowrap">{fechaEmision}</div>
            </div>
          </div>

          {/* Ficha del Alumno */}
          <div className="bg-(--bg-surface) print:bg-neutral-50 border border-(--border-color) print:border-neutral-300 rounded-xl p-4 font-mono text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 uppercase block">Alumno / Estudiante:</span>
              <span className="font-bold text-sm text-(--text-body) print:text-black">
                {perfil.nombre || 'Estudiante UTN ISI'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 uppercase block">Legajo Universitario:</span>
              <span className="font-bold text-sm text-(--color-primary) print:text-black">
                {perfil.legajo || 'Sin registrar'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 uppercase block">Carrera:</span>
              <span className="font-bold text-(--text-body) print:text-black">
                Ing. en Sistemas de Información
              </span>
            </div>
          </div>

          {/* Métricas Principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="bg-(--bg-surface) print:bg-neutral-50 border border-(--border-color) print:border-neutral-300 rounded-xl p-3">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 uppercase">Avance Carrera</div>
              <div className="text-lg font-bold text-(--color-primary) print:text-black">{stats.porcentajeCarrera}%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600">{stats.aprobadasCount} / {stats.totalTroncales} troncales</div>
            </div>

            <div className="bg-(--bg-surface) print:bg-neutral-50 border border-(--border-color) print:border-neutral-300 rounded-xl p-3">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 uppercase">Promedio Académico</div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400 print:text-black">
                {formatPromedio(stats.promedio)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600">Materias aprobadas</div>
            </div>

            <div className="bg-(--bg-surface) print:bg-neutral-50 border border-(--border-color) print:border-neutral-300 rounded-xl p-3">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 uppercase">Electivas Aprobadas</div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 print:text-black whitespace-nowrap">{stats.horasElectivasAprobadas} hs</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 whitespace-nowrap">Meta: 20 hs (ADUSI: 4 hs)</div>
            </div>

            <div className="bg-(--bg-surface) print:bg-neutral-50 border border-(--border-color) print:border-neutral-300 rounded-xl p-3">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 uppercase">Práctica PPS</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 print:text-black whitespace-nowrap">{ppsHoras} hs</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 whitespace-nowrap">Meta: 200 hs requeridas</div>
            </div>
          </div>

          {/* Grilla de Materias Troncales por Nivel */}
          <div className="space-y-5">
            <h2 className="font-syne font-bold text-sm text-(--text-body) print:text-black uppercase tracking-wider border-b border-(--border-color) print:border-neutral-300 pb-1 flex items-center justify-between">
              <span>Asignaturas Troncales (Plan 2023)</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 print:text-neutral-600 lowercase font-normal">
                {stats.aprobadasCount} aprobadas · {stats.regularesCount} regulares · {stats.cursablesCount} cursables
              </span>
            </h2>

            {niveles.map(nivel => {
              const materiasNivel = MATERIAS_TRONCALES.filter(m => m.nivel === nivel && !m.esAdusiSolo);

              return (
                <div key={nivel} className="space-y-1.5 print:break-inside-avoid">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-(--color-primary) print:text-black pb-0.5">
                    <span>{nivel}º AÑO / NIVEL</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-neutral-600 font-normal">
                      {materiasNivel.filter(m => estados[m.id] === 'aprobada').length} / {materiasNivel.length} aprobadas
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[11px] border-collapse border border-(--border-color) print:border-neutral-300">
                      <thead>
                        <tr className="bg-(--bg-elevated) print:bg-neutral-100 border-b border-(--border-color) print:border-neutral-300 text-(--text-body) print:text-black">
                          <th className="py-1.5 px-2 w-10">Cód</th>
                          <th className="py-1.5 px-2">Materia</th>
                          <th className="py-1.5 px-2 w-16 text-center">Régimen</th>
                          <th className="py-1.5 px-2 w-12 text-center">Hs</th>
                          <th className="py-1.5 px-2 w-24 text-center">Estado</th>
                          <th className="py-1.5 px-2 w-16 text-center">Nota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materiasNivel.map(m => {
                          const est = estados[m.id] || 'pendiente';
                          const n = notas[m.id];

                          let estadoBadge = <span className="text-slate-400 dark:text-slate-500">Pendiente</span>;
                          if (est === 'aprobada') {
                            estadoBadge = <span className="text-emerald-600 dark:text-emerald-400 print:text-neutral-900 font-bold">APROBADA</span>;
                          } else if (est === 'regular') {
                            estadoBadge = <span className="text-amber-600 dark:text-amber-400 print:text-neutral-800 font-medium">REGULAR</span>;
                          }

                          return (
                            <tr
                              key={m.id}
                              className="border-b border-(--border-color)/60 print:border-neutral-200 hover:bg-(--bg-elevated)/40 print:hover:bg-transparent"
                            >
                              <td className="py-1 px-2 text-slate-400 dark:text-slate-500 font-bold">#{String(m.id).padStart(2, '0')}</td>
                              <td className="py-1 px-2 font-semibold text-(--text-body) print:text-black">{m.nombreCompleto}</td>
                              <td className="py-1 px-2 text-center text-slate-500 dark:text-slate-400 print:text-neutral-700 text-[10px]">
                                {m.esCuatrimestral ? 'Cuatrim.' : 'Anual'}
                              </td>
                              <td className="py-1 px-2 text-center text-slate-500 dark:text-slate-400 print:text-neutral-700 whitespace-nowrap">{m.horas} hs</td>
                              <td className="py-1 px-2 text-center text-[10px]">{estadoBadge}</td>
                              <td className="py-1 px-2 text-center font-bold text-purple-600 dark:text-purple-300 print:text-black">
                                {est === 'aprobada' && n?.nota !== undefined ? n.nota : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Asignaturas Electivas Acreditadas */}
          {electivasAprobadas.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-(--border-color) print:border-neutral-300 print:break-inside-avoid">
              <h3 className="font-syne font-bold text-xs text-(--text-body) print:text-black uppercase">
                Asignaturas Electivas Acreditadas ({stats.horasElectivasAprobadas} hs)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                {electivasAprobadas.map(e => (
                  <div
                    key={e.id}
                    className="p-2 rounded bg-(--bg-surface) print:bg-neutral-50 border border-(--border-color) print:border-neutral-300 flex items-center justify-between"
                  >
                    <span className="font-semibold text-(--text-body) print:text-black">{e.nombre} ({e.nivel}º Nivel)</span>
                    <span className="text-amber-600 dark:text-amber-400 print:text-black font-bold text-[11px] whitespace-nowrap">+{e.horas} hs</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximos Finales Planificados (Metas) */}
          {metasArray.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-(--border-color) print:border-neutral-300 print:break-inside-avoid">
              <h3 className="font-syne font-bold text-xs text-(--color-primary) print:text-black uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Metas Tentativas de Examen Agendadas</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                {metasArray.map(meta => (
                  <div
                    key={meta.materiaId}
                    className="p-2.5 rounded bg-(--bg-surface) print:bg-neutral-50 border border-(--color-primary-border) print:border-neutral-300 flex flex-col justify-between"
                  >
                    <div className="font-bold text-(--text-body) print:text-black">
                      {MATERIAS_MAP[meta.materiaId]?.nombreCompleto}
                    </div>
                    <div className="text-[11px] text-(--color-primary) print:text-neutral-700 mt-1">
                      {meta.turnoNombre} {meta.fechaEstimada ? `(${meta.fechaEstimada})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pie de Página */}
          <div className="pt-6 border-t border-(--border-color) print:border-neutral-300 text-center font-mono text-[10px] text-slate-500 dark:text-slate-400 print:text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Tracker Plan de Estudio ISI · UTN Facultad Regional Rosario</span>
            <span>Documento generado con fines informativos y de seguimiento académico</span>
          </div>

        </div>
      </div>
    </div>
  );
};
