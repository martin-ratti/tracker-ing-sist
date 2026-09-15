import React, { useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS, MATERIAS_MAP } from '../data/plan2023';
import { 
  X, 
  Printer, 
  FileText, 
  User, 
  Sparkles
} from 'lucide-react';

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

  const modalRef = useFocusTrap(reportOpen);

  useEffect(() => {
    if (!reportOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReportOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [reportOpen, setReportOpen]);

  if (!reportOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const fechaEmision = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const niveles = [1, 2, 3, 4, 5];
  const electivasAprobadas = MATERIAS_ELECTIVAS.filter(e => estadosElectivas[e.id] === 'aprobada');
  const metasArray = Object.values(metasExamen);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static"
      onClick={() => setReportOpen(false)}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className="bg-[#0b101c] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none print:bg-white print:text-black"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra de Acciones (oculta al imprimir) */}
        <div className="p-4 border-b border-slate-800 bg-[#0d1527] flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-sm sm:text-base font-bold font-syne text-white">
                Ficha Curricular y Analítico de Avance
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Plan 2023 · UTN Facultad Regional Rosario
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
              title="Editar nombre y legajo"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar Perfil</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-colors shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setReportOpen(false)}
              aria-label="Cerrar reporte"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENEDOR DE LA FICHA IMPRIMIBLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-slate-200 print:overflow-visible print:p-0 print:text-black bg-[#070b13] print:bg-white">
          
          {/* Encabezado Institucional */}
          <div className="border-b-2 border-slate-800 print:border-black pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Emblema UTN */}
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 print:border-black flex flex-col items-center justify-center text-center font-syne font-black text-cyan-400 print:text-black">
                <span className="text-xs leading-none">UTN</span>
                <span className="text-[9px] text-slate-400 print:text-black tracking-widest">FRRo</span>
              </div>
              <div>
                <h1 className="font-syne font-black text-base sm:text-lg text-white print:text-black tracking-wide leading-tight">
                  UNIVERSIDAD TECNOLÓGICA NACIONAL
                </h1>
                <p className="text-xs font-mono text-slate-300 print:text-neutral-700 font-semibold">
                  Facultad Regional Rosario · Dpto. Ingeniería en Sistemas de Información
                </p>
                <p className="text-[11px] font-mono text-cyan-400 print:text-neutral-600">
                  Plan de Estudio 2023 · Estado de Correlatividades y Calificaciones
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-[11px] text-slate-400 print:text-neutral-600">
              <div>Fecha de Emisión:</div>
              <div className="font-bold text-slate-200 print:text-black">{fechaEmision} hs</div>
            </div>
          </div>

          {/* Ficha del Alumno */}
          <div className="bg-[#0b101c] print:bg-neutral-50 border border-slate-800 print:border-neutral-300 rounded-xl p-4 font-mono text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 print:text-neutral-600 uppercase block">Alumno / Estudiante:</span>
              <span className="font-bold text-sm text-white print:text-black">
                {perfil.nombre || 'Estudiante UTN ISI'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-neutral-600 uppercase block">Legajo Universitario:</span>
              <span className="font-bold text-sm text-cyan-400 print:text-black">
                {perfil.legajo || 'Sin registrar'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-neutral-600 uppercase block">Carrera:</span>
              <span className="font-bold text-slate-200 print:text-black">
                Ing. en Sistemas de Información
              </span>
            </div>
          </div>

          {/* Métricas Principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="bg-[#0b101c] print:bg-neutral-50 border border-slate-800 print:border-neutral-300 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 print:text-neutral-600 uppercase">Avance Carrera</div>
              <div className="text-lg font-bold text-cyan-400 print:text-black">{stats.porcentajeCarrera}%</div>
              <div className="text-[10px] text-slate-500 print:text-neutral-600">{stats.aprobadasCount} / {stats.totalTroncales} troncales</div>
            </div>

            <div className="bg-[#0b101c] print:bg-neutral-50 border border-slate-800 print:border-neutral-300 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 print:text-neutral-600 uppercase">Promedio s/ Aplazos</div>
              <div className="text-lg font-bold text-purple-400 print:text-black">
                {stats.promedioSinAplazos ?? '—'}
              </div>
              <div className="text-[10px] text-slate-500 print:text-neutral-600">c/ aplazos: {stats.promedioConAplazos ?? '—'}</div>
            </div>

            <div className="bg-[#0b101c] print:bg-neutral-50 border border-slate-800 print:border-neutral-300 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 print:text-neutral-600 uppercase">Electivas Aprobadas</div>
              <div className="text-lg font-bold text-amber-400 print:text-black">{stats.horasElectivasAprobadas} hs</div>
              <div className="text-[10px] text-slate-500 print:text-neutral-600">Meta: 20 hs (ADUSI: 4 hs)</div>
            </div>

            <div className="bg-[#0b101c] print:bg-neutral-50 border border-slate-800 print:border-neutral-300 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 print:text-neutral-600 uppercase">Práctica PPS</div>
              <div className="text-lg font-bold text-emerald-400 print:text-black">{ppsHoras} hs</div>
              <div className="text-[10px] text-slate-500 print:text-neutral-600">Meta: 200 hs requeridas</div>
            </div>
          </div>

          {/* Grilla de Materias Troncales por Nivel */}
          <div className="space-y-5">
            <h2 className="font-syne font-bold text-sm text-white print:text-black uppercase tracking-wider border-b border-slate-800 print:border-neutral-300 pb-1 flex items-center justify-between">
              <span>Asignaturas Troncales (Plan 2023)</span>
              <span className="text-xs font-mono text-slate-400 print:text-neutral-600 lowercase font-normal">
                {stats.aprobadasCount} aprobadas · {stats.regularesCount} regulares · {stats.cursablesCount} cursables
              </span>
            </h2>

            {niveles.map(nivel => {
              const materiasNivel = MATERIAS_TRONCALES.filter(m => m.nivel === nivel && !m.esAdusiSolo);

              return (
                <div key={nivel} className="space-y-1.5 print:break-inside-avoid">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400 print:text-black pb-0.5">
                    <span>{nivel}º AÑO / NIVEL</span>
                    <span className="text-[11px] text-slate-400 print:text-neutral-600 font-normal">
                      {materiasNivel.filter(m => estados[m.id] === 'aprobada').length} / {materiasNivel.length} aprobadas
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[11px] border-collapse border border-slate-800 print:border-neutral-300">
                      <thead>
                        <tr className="bg-slate-900/80 print:bg-neutral-100 border-b border-slate-800 print:border-neutral-300 text-slate-300 print:text-black">
                          <th className="py-1.5 px-2 w-10">Cód</th>
                          <th className="py-1.5 px-2">Materia</th>
                          <th className="py-1.5 px-2 w-16 text-center">Régimen</th>
                          <th className="py-1.5 px-2 w-12 text-center">Hs</th>
                          <th className="py-1.5 px-2 w-24 text-center">Estado</th>
                          <th className="py-1.5 px-2 w-14 text-center">Nota</th>
                          <th className="py-1.5 px-2 w-24 text-center">Fecha</th>
                          <th className="py-1.5 px-2 w-20 text-center">Libro/Folio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materiasNivel.map(m => {
                          const est = estados[m.id] || 'pendiente';
                          const n = notas[m.id];

                          let estadoBadge = <span className="text-slate-500">Pendiente</span>;
                          if (est === 'aprobada') {
                            estadoBadge = <span className="text-emerald-400 print:text-neutral-900 font-bold">APROBADA</span>;
                          } else if (est === 'regular') {
                            estadoBadge = <span className="text-amber-400 print:text-neutral-800 font-medium">REGULAR</span>;
                          }

                          return (
                            <tr
                              key={m.id}
                              className="border-b border-slate-800/60 print:border-neutral-200 hover:bg-slate-900/30 print:hover:bg-transparent"
                            >
                              <td className="py-1 px-2 text-slate-500 font-bold">#{String(m.id).padStart(2, '0')}</td>
                              <td className="py-1 px-2 font-semibold text-slate-200 print:text-black">{m.nombreCompleto}</td>
                              <td className="py-1 px-2 text-center text-slate-400 print:text-neutral-700 text-[10px]">
                                {m.esCuatrimestral ? 'Cuatrim.' : 'Anual'}
                              </td>
                              <td className="py-1 px-2 text-center text-slate-400 print:text-neutral-700">{m.horas}h</td>
                              <td className="py-1 px-2 text-center text-[10px]">{estadoBadge}</td>
                              <td className="py-1 px-2 text-center font-bold text-purple-300 print:text-black">
                                {n?.nota !== undefined ? n.nota : '—'}
                              </td>
                              <td className="py-1 px-2 text-center text-slate-400 print:text-neutral-700 text-[10px]">
                                {n?.fecha || '—'}
                              </td>
                              <td className="py-1 px-2 text-center text-slate-400 print:text-neutral-700 text-[10px]">
                                {n?.libro && n?.folio ? `${n.libro}/${n.folio}` : '—'}
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
            <div className="space-y-2 pt-3 border-t border-slate-800 print:border-neutral-300 print:break-inside-avoid">
              <h3 className="font-syne font-bold text-xs text-white print:text-black uppercase">
                Asignaturas Electivas Acreditadas ({stats.horasElectivasAprobadas} hs)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                {electivasAprobadas.map(e => (
                  <div
                    key={e.id}
                    className="p-2 rounded bg-slate-900/60 print:bg-neutral-50 border border-slate-800 print:border-neutral-300 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200 print:text-black">{e.nombre} ({e.nivel}º Nivel)</span>
                    <span className="text-amber-400 print:text-black font-bold text-[11px]">+{e.horas} hs</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximos Finales Planificados (Metas) */}
          {metasArray.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-800 print:border-neutral-300 print:break-inside-avoid">
              <h3 className="font-syne font-bold text-xs text-cyan-400 print:text-black uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Metas Tentativas de Examen Agendadas</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                {metasArray.map(meta => (
                  <div
                    key={meta.materiaId}
                    className="p-2.5 rounded bg-[#0b1222] print:bg-neutral-50 border border-cyan-500/30 print:border-neutral-300 flex flex-col justify-between"
                  >
                    <div className="font-bold text-white print:text-black">
                      {MATERIAS_MAP[meta.materiaId]?.nombreCompleto}
                    </div>
                    <div className="text-[11px] text-cyan-300 print:text-neutral-700 mt-1">
                      {meta.turnoNombre} {meta.fechaEstimada ? `(${meta.fechaEstimada})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pie de Página */}
          <div className="pt-6 border-t border-slate-800 print:border-neutral-300 text-center font-mono text-[10px] text-slate-500 print:text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Tracker Plan de Estudio ISI · UTN Facultad Regional Rosario</span>
            <span>Documento generado con fines informativos y de seguimiento académico</span>
          </div>

        </div>
      </div>
    </div>
  );
};
