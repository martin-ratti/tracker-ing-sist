import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { EstadoMateria, Materia, Electiva, NotaMateria, ProgresoUsuario, PerfilAlumno, MetaExamen } from '../types/plan';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS, MATERIAS_MAP, ELECTIVAS_MAP } from '../data/plan2023';
import { fetchProgress, persistProgress, clearProgress } from '../services/api';

export type GridFilterOption = 'todas' | 'cursables' | 'regulares' | 'aprobadas' | 'con-meta';

interface Stats {
  aprobadasCount: number;
  regularesCount: number;
  cursablesCount: number;
  totalTroncales: number;
  porcentajeCarrera: number;
  horasElectivasAprobadas: number;
  promedioConAplazos: number | null;
  promedioSinAplazos: number | null;
  adusiCumplido: boolean;
  adusiProgreso: number; // 0 - 100
  adusiFaltantes: string[];
  ingenieroCumplido: boolean;
  ingenieroProgreso: number; // 0 - 100
  ingenieroFaltantes: string[];
  metasCount: number;
}

interface TrackerContextType {
  estados: Record<number, EstadoMateria>;
  estadosElectivas: Record<number, EstadoMateria>;
  notas: Record<number, NotaMateria>;
  ppsHoras: number;
  setPpsHoras: (hs: number) => void;
  perfil: PerfilAlumno;
  setPerfil: (p: PerfilAlumno) => void;
  metasExamen: Record<number, MetaExamen>;
  setMetaExamen: (materiaId: number, meta: MetaExamen) => void;
  removeMetaExamen: (materiaId: number) => void;
  edgeMode: 'ambos' | 'regular' | 'aprobada';
  setEdgeMode: (mode: 'ambos' | 'regular' | 'aprobada') => void;
  viewMode: 'grafo' | 'malla';
  setViewMode: (mode: 'grafo' | 'malla') => void;
  gridFilter: GridFilterOption;
  setGridFilter: (filter: GridFilterOption) => void;
  electivasOpen: boolean;
  setElectivasOpen: (open: boolean) => void;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  reportOpen: boolean;
  setReportOpen: (open: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  focusedSubjectId: number | null;
  setFocusedSubjectId: (id: number | null) => void;
  selectedSubjectId: number | null;
  setSelectedSubjectId: (id: number | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  toggleMateriaEstado: (id: number) => void;
  setEstadoDirecto: (id: number, estado: EstadoMateria) => void;
  toggleElectivaEstado: (id: number) => void;
  setNotaMateria: (id: number, nota: NotaMateria) => void;
  puedeRegularMateria: (m: Materia) => boolean;
  puedeAprobarMateria: (m: Materia) => boolean;
  esMateriaCursable: (m: Materia) => boolean;
  esMateriaRendible: (m: Materia) => boolean;
  puedeRegularElectiva: (e: Electiva) => boolean;
  esElectivaCursable: (e: Electiva) => boolean;
  stats: Stats;
  resetAll: () => void;
  reloadProgress: () => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estados, setEstados] = useState<Record<number, EstadoMateria>>({});
  const [estadosElectivas, setEstadosElectivas] = useState<Record<number, EstadoMateria>>({});
  const [notas, setNotas] = useState<Record<number, NotaMateria>>({});
  const [ppsHoras, setPpsHorasState] = useState<number>(0);
  const [perfil, setPerfilState] = useState<PerfilAlumno>({ nombre: '', legajo: '' });
  const [metasExamen, setMetasExamenState] = useState<Record<number, MetaExamen>>({});
  const [gridFilter, setGridFilter] = useState<GridFilterOption>('todas');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [focusedSubjectId, setFocusedSubjectId] = useState<number | null>(null);
  const [edgeMode, setEdgeMode] = useState<'ambos' | 'regular' | 'aprobada'>('ambos');
  const [viewMode, setViewMode] = useState<'grafo' | 'malla'>('grafo');
  const [electivasOpen, setElectivasOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Cargar estado
  const reloadProgress = useCallback(() => {
    fetchProgress()
      .then((data: ProgresoUsuario) => {
        setEstados(data.estados || {});
        setEstadosElectivas(data.estadosElectivas || {});
        setNotas(data.notas || {});
        setPpsHorasState(data.ppsHoras !== undefined ? data.ppsHoras : 0);
        setPerfilState(data.perfil || { nombre: '', legajo: '' });
        setMetasExamenState(data.metasExamen || {});
      })
      .catch(err => console.error('Error al cargar progreso:', err));
  }, []);

  useEffect(() => {
    reloadProgress();
  }, [reloadProgress]);

  const getEstado = useCallback((id: number): EstadoMateria => {
    return estados[id] || 'pendiente';
  }, [estados]);

  const getEstadoElectiva = useCallback((id: number): EstadoMateria => {
    return estadosElectivas[id] || 'pendiente';
  }, [estadosElectivas]);

  // Validaciones
  const cumpleReqsCursada = useCallback((m: Materia): boolean => {
    const regularOk = m.reqRegular.every(c => {
      const e = getEstado(c);
      return e === 'regular' || e === 'aprobada';
    });

    let aprobadaOk = false;
    if (m.reqAprobada === 'TODAS') {
      aprobadaOk = MATERIAS_TRONCALES.filter(x => x.id !== m.id).every(x => getEstado(x.id) === 'aprobada');
    } else {
      aprobadaOk = m.reqAprobada.every(c => getEstado(c) === 'aprobada');
    }

    return regularOk && aprobadaOk;
  }, [getEstado]);

  const puedeRegularMateria = useCallback((m: Materia): boolean => {
    return cumpleReqsCursada(m);
  }, [cumpleReqsCursada]);

  const puedeAprobarMateria = useCallback((m: Materia): boolean => {
    const est = getEstado(m.id);
    if (est !== 'regular') return false;

    if (m.reqRendirAprobada) {
      if (m.reqRendirAprobada === 'TODAS') {
        const todasLasDemas = MATERIAS_TRONCALES.filter(x => x.id !== m.id);
        return todasLasDemas.every(x => getEstado(x.id) === 'aprobada');
      } else {
        return m.reqRendirAprobada.every(c => getEstado(c) === 'aprobada');
      }
    }
    return true;
  }, [getEstado]);

  const esMateriaCursable = useCallback((m: Materia): boolean => {
    return getEstado(m.id) === 'pendiente' && cumpleReqsCursada(m);
  }, [getEstado, cumpleReqsCursada]);

  const esMateriaRendible = useCallback((m: Materia): boolean => {
    return getEstado(m.id) === 'regular' && puedeAprobarMateria(m);
  }, [getEstado, puedeAprobarMateria]);

  // Electivas
  const puedeRegularElectiva = useCallback((e: Electiva): boolean => {
    const regOk = e.reqRegular.every(c => {
      const est = getEstado(c);
      return est === 'regular' || est === 'aprobada';
    });
    const aprOk = e.reqAprobada.every(c => getEstado(c) === 'aprobada');
    return regOk && aprOk;
  }, [getEstado]);

  const esElectivaCursable = useCallback((e: Electiva): boolean => {
    return getEstadoElectiva(e.id) === 'pendiente' && puedeRegularElectiva(e);
  }, [getEstadoElectiva, puedeRegularElectiva]);

  // Reseteo en Cascada
  const applyCascade = useCallback((currentEstados: Record<number, EstadoMateria>, currentElectivas: Record<number, EstadoMateria>) => {
    const newEstados = { ...currentEstados };
    const newElectivas = { ...currentElectivas };

    let changed = true;
    while (changed) {
      changed = false;

      // Troncales
      MATERIAS_TRONCALES.forEach(m => {
        const est = newEstados[m.id] || 'pendiente';
        if (est === 'pendiente') return;

        const regularOk = m.reqRegular.every(c => {
          const e = newEstados[c] || 'pendiente';
          return e === 'regular' || e === 'aprobada';
        });
        const aprobadaOk = m.reqAprobada === 'TODAS'
          ? MATERIAS_TRONCALES.filter(x => x.id !== m.id).every(x => (newEstados[x.id] || 'pendiente') === 'aprobada')
          : m.reqAprobada.every(c => (newEstados[c] || 'pendiente') === 'aprobada');

        if (!regularOk || !aprobadaOk) {
          newEstados[m.id] = 'pendiente';
          changed = true;
        } else if (est === 'aprobada' && m.reqRendirAprobada) {
          let rendirOk = true;
          if (m.reqRendirAprobada === 'TODAS') {
            rendirOk = MATERIAS_TRONCALES.filter(x => x.id !== m.id).every(x => (newEstados[x.id] || 'pendiente') === 'aprobada');
          } else {
            rendirOk = m.reqRendirAprobada.every(c => (newEstados[c] || 'pendiente') === 'aprobada');
          }
          if (!rendirOk) {
            newEstados[m.id] = 'regular';
            changed = true;
          }
        }
      });

      // Electivas
      MATERIAS_ELECTIVAS.forEach(e => {
        const est = newElectivas[e.id] || 'pendiente';
        if (est === 'pendiente') return;

        const regOk = e.reqRegular.every(c => {
          const s = newEstados[c] || 'pendiente';
          return s === 'regular' || s === 'aprobada';
        });
        const aprOk = e.reqAprobada.every(c => (newEstados[c] || 'pendiente') === 'aprobada');

        if (!regOk || !aprOk) {
          newElectivas[e.id] = 'pendiente';
          changed = true;
        }
      });
    }

    return { newEstados, newElectivas };
  }, []);

  // Alternar estado de una materia
  const toggleMateriaEstado = useCallback((id: number) => {
    const m = MATERIAS_MAP[id];
    if (!m) return;
    const actual = getEstado(id);

    let nextEstados = { ...estados };
    let nextElectivas = { ...estadosElectivas };

    if (actual === 'pendiente') {
      if (!puedeRegularMateria(m)) {
        const faltaReg = m.reqRegular
          .filter(c => {
            const e = getEstado(c);
            return e !== 'regular' && e !== 'aprobada';
          })
          .map(c => MATERIAS_MAP[c]?.nombre || `#${c}`);

        const faltaApr = m.reqAprobada === 'TODAS'
          ? ['Todas las materias restantes']
          : m.reqAprobada
              .filter(c => getEstado(c) !== 'aprobada')
              .map(c => MATERIAS_MAP[c]?.nombre || `#${c}`);

        const msgPartes: string[] = [];
        if (faltaReg.length > 0) msgPartes.push(`Regularizar: ${faltaReg.join(', ')}`);
        if (faltaApr.length > 0) msgPartes.push(`Aprobar: ${faltaApr.join(', ')}`);
        showToast(msgPartes.join(' • '));
        return;
      }
      nextEstados[id] = 'regular';
      showToast(`🟡 ${m.nombre} marcada como REGULAR`);
    } else if (actual === 'regular') {
      if (!puedeAprobarMateria(m)) {
        if (m.reqRendirAprobada === 'TODAS') {
          showToast('⚠️ Para rendir Proyecto Final debes tener TODAS las materias anteriores aprobadas');
          return;
        }
        if (m.esAdusiSolo) {
          showToast('⚠️ Para aprobar el Seminario ADUSI debes tener aprobado todo 1º, 2º y 3º año');
          return;
        }
        showToast(`⚠️ No cumples con las correlativas necesarias para aprobar ${m.nombre}`);
        return;
      }
      nextEstados[id] = 'aprobada';
      showToast(`🟢 ${m.nombre} marcada como APROBADA`);
    } else {
      nextEstados[id] = 'pendiente';
      showToast(`⚪ ${m.nombre} reseteada a PENDIENTE`);
      const cascaded = applyCascade(nextEstados, nextElectivas);
      nextEstados = cascaded.newEstados;
      nextElectivas = cascaded.newElectivas;
    }

    setEstados(nextEstados);
    setEstadosElectivas(nextElectivas);
    persistProgress({ estados: nextEstados, estadosElectivas: nextElectivas });
  }, [estados, estadosElectivas, getEstado, puedeRegularMateria, puedeAprobarMateria, showToast, applyCascade]);

  // Establecer un estado concreto sin pasar por el ciclo de toggle
  const setEstadoDirecto = useCallback((id: number, estado: EstadoMateria) => {
    const m = MATERIAS_MAP[id];
    if (!m) return;

    if (estado === 'regular' && !puedeRegularMateria(m)) {
      showToast(`⚠️ No cumples las correlativas para regularizar ${m.nombre}`);
      return;
    }

    if (estado === 'aprobada') {
      if (!cumpleReqsCursada(m)) {
        showToast(`⚠️ No cumples con los requisitos previos de ${m.nombre}`);
        return;
      }
      if (!puedeAprobarMateria(m)) {
        if (m.esAdusiSolo) {
          showToast('⚠️ Para aprobar el Seminario ADUSI debes tener aprobado todo 1º, 2º y 3º año');
        } else if (m.reqRendirAprobada === 'TODAS') {
          showToast('⚠️ Para aprobar Proyecto Final debes tener aprobadas todas las materias anteriores');
        } else {
          showToast(`⚠️ No cumples con las correlativas de aprobación para ${m.nombre}`);
        }
        return;
      }
    }

    let nextEstados = { ...estados, [id]: estado };
    let nextElectivas = { ...estadosElectivas };

    if (estado === 'pendiente') {
      const cascaded = applyCascade(nextEstados, nextElectivas);
      nextEstados = cascaded.newEstados;
      nextElectivas = cascaded.newElectivas;
    }

    setEstados(nextEstados);
    setEstadosElectivas(nextElectivas);
    persistProgress({ estados: nextEstados, estadosElectivas: nextElectivas, notas, ppsHoras });
  }, [estados, estadosElectivas, notas, ppsHoras, applyCascade, puedeRegularMateria, puedeAprobarMateria, cumpleReqsCursada, showToast]);

  // Alternar estado de una electiva
  const toggleElectivaEstado = useCallback((id: number) => {
    const e = ELECTIVAS_MAP[id];
    if (!e) return;
    const actual = getEstadoElectiva(id);

    let nextElectivas = { ...estadosElectivas };

    if (actual === 'pendiente') {
      if (!puedeRegularElectiva(e)) {
        const faltaReg = e.reqRegular
          .filter(c => {
            const s = getEstado(c);
            return s !== 'regular' && s !== 'aprobada';
          })
          .map(c => MATERIAS_MAP[c]?.nombre || `#${c}`);

        const faltaApr = e.reqAprobada
          .filter(c => getEstado(c) !== 'aprobada')
          .map(c => MATERIAS_MAP[c]?.nombre || `#${c}`);

        const msgPartes: string[] = [];
        if (faltaReg.length > 0) msgPartes.push(`Regularizar: ${faltaReg.join(', ')}`);
        if (faltaApr.length > 0) msgPartes.push(`Aprobar: ${faltaApr.join(', ')}`);
        showToast(msgPartes.join(' • '));
        return;
      }
      nextElectivas[id] = 'regular';
      showToast(`🟡 Electiva "${e.nombre}" marcada como REGULAR`);
    } else if (actual === 'regular') {
      nextElectivas[id] = 'aprobada';
      showToast(`🟢 Electiva "${e.nombre}" (+${e.horas}hs) APROBADA`);
    } else {
      nextElectivas[id] = 'pendiente';
      showToast(`⚪ Electiva "${e.nombre}" reseteada a PENDIENTE`);
    }

    setEstadosElectivas(nextElectivas);
    persistProgress({ estadosElectivas: nextElectivas });
  }, [estadosElectivas, getEstadoElectiva, puedeRegularElectiva, getEstado, showToast]);

  const setNotaMateria = useCallback((id: number, notaData: NotaMateria) => {
    setNotas(prev => {
      const next = { ...prev, [id]: notaData };
      persistProgress({ notas: next });
      return next;
    });
  }, []);

  const setPpsHoras = useCallback((hs: number) => {
    setPpsHorasState(hs);
    persistProgress({ ppsHoras: hs });
  }, []);

  const setPerfil = useCallback((p: PerfilAlumno) => {
    setPerfilState(p);
    persistProgress({ perfil: p });
  }, []);

  const setMetaExamen = useCallback((materiaId: number, meta: MetaExamen) => {
    setMetasExamenState(prev => {
      const next = { ...prev, [materiaId]: meta };
      persistProgress({ metasExamen: next });
      return next;
    });
    showToast(`🎯 Meta agendada: ${meta.turnoNombre}`);
  }, [showToast]);

  const removeMetaExamen = useCallback((materiaId: number) => {
    setMetasExamenState(prev => {
      const next = { ...prev };
      delete next[materiaId];
      persistProgress({ metasExamen: next });
      return next;
    });
    showToast('Meta de examen eliminada');
  }, [showToast]);

  const resetAll = useCallback(() => {
    setEstados({});
    setEstadosElectivas({});
    setNotas({});
    setPpsHorasState(0);
    setPerfilState({ nombre: '', legajo: '' });
    setMetasExamenState({});
    clearProgress();
    showToast('Plan reseteado por completo.');
  }, [showToast]);

  // Cálculo de estadísticas
  const stats: Stats = useMemo(() => {
    const troncalesArray = MATERIAS_TRONCALES.filter(m => !m.esAdusiSolo);
    const aprobadas = troncalesArray.filter(m => getEstado(m.id) === 'aprobada').length;
    const regulares = troncalesArray.filter(m => getEstado(m.id) === 'regular').length;
    const cursables = troncalesArray.filter(m => esMateriaCursable(m)).length;
    const totalTroncales = troncalesArray.length;
    const porcentajeCarrera = Number(((aprobadas / totalTroncales) * 100).toFixed(1));

    // Electivas
    const electivasAprobadas = MATERIAS_ELECTIVAS.filter(e => getEstadoElectiva(e.id) === 'aprobada');
    const horasElectivasAprobadas = electivasAprobadas.reduce((acc, curr) => acc + curr.horas, 0);

    // Promedios
    let notasSuma = 0;
    let notasCount = 0;
    let notasSinAplazoSuma = 0;
    let notasSinAplazoCount = 0;

    Object.values(notas).forEach(n => {
      if (n && typeof n.nota === 'number' && !isNaN(n.nota)) {
        notasSuma += n.nota;
        notasCount += 1;
        if (n.nota >= 6) {
          notasSinAplazoSuma += n.nota;
          notasSinAplazoCount += 1;
        }
      }
    });

    const promedioConAplazos = notasCount > 0 ? Number((notasSuma / notasCount).toFixed(2)) : null;
    const promedioSinAplazos = notasSinAplazoCount > 0 ? Number((notasSinAplazoSuma / notasSinAplazoCount).toFixed(2)) : null;

    // ADUSI: 1º, 2º y 3º año completos (id 1 a 23) + Seminario Integrador (id 99) + >= 4hs electivas
    const materiasAdusi = MATERIAS_TRONCALES.filter(m => m.nivel <= 3 && !m.esAdusiSolo);
    const adusiTroncalesAprobadas = materiasAdusi.every(m => getEstado(m.id) === 'aprobada');
    const seminarioAprobado = getEstado(99) === 'aprobada';
    const adusiElectivasOk = horasElectivasAprobadas >= 4;

    const adusiFaltantes: string[] = [];
    if (!adusiTroncalesAprobadas) {
      const faltan = materiasAdusi.filter(m => getEstado(m.id) !== 'aprobada').map(m => m.nombre);
      adusiFaltantes.push(`Materias 1°-3° nivel (${faltan.length} pendientes)`);
    }
    if (!seminarioAprobado) adusiFaltantes.push('Seminario Integrador');
    if (!adusiElectivasOk) adusiFaltantes.push(`Electivas (${horasElectivasAprobadas}/4 hs)`);

    const adusiPuntosTotales = materiasAdusi.length + 1 + 1; // troncales + seminario + electivas
    let adusiPuntosActuales = materiasAdusi.filter(m => getEstado(m.id) === 'aprobada').length;
    if (seminarioAprobado) adusiPuntosActuales += 1;
    if (adusiElectivasOk) adusiPuntosActuales += 1;
    const adusiProgreso = Math.round((adusiPuntosActuales / adusiPuntosTotales) * 100);

    const adusiCumplido = adusiTroncalesAprobadas && seminarioAprobado && adusiElectivasOk;

    // Ingeniero: 36 troncales + 20hs electivas + 200hs PPS
    const todasTroncalesOk = aprobadas === totalTroncales;
    const ingElectivasOk = horasElectivasAprobadas >= 20;
    const ppsOk = ppsHoras >= 200;

    const ingenieroFaltantes: string[] = [];
    if (!todasTroncalesOk) ingenieroFaltantes.push(`Troncales (${totalTroncales - aprobadas} pendientes)`);
    if (!ingElectivasOk) ingenieroFaltantes.push(`Electivas (${horasElectivasAprobadas}/20 hs)`);
    if (!ppsOk) ingenieroFaltantes.push(`PPS (${ppsHoras}/200 hs)`);

    const ingPuntosTotales = totalTroncales + 20 + 200;
    const ingPuntosActuales = aprobadas + Math.min(horasElectivasAprobadas, 20) + Math.min(ppsHoras, 200);
    const ingenieroProgreso = Math.round((ingPuntosActuales / ingPuntosTotales) * 100);

    const ingenieroCumplido = todasTroncalesOk && ingElectivasOk && ppsOk;
    const metasCount = Object.keys(metasExamen).length;

    return {
      aprobadasCount: aprobadas,
      regularesCount: regulares,
      cursablesCount: cursables,
      totalTroncales,
      porcentajeCarrera,
      horasElectivasAprobadas,
      promedioConAplazos,
      promedioSinAplazos,
      adusiCumplido,
      adusiProgreso,
      adusiFaltantes,
      ingenieroCumplido,
      ingenieroProgreso,
      ingenieroFaltantes,
      metasCount
    };
  }, [getEstado, getEstadoElectiva, notas, ppsHoras, metasExamen, esMateriaCursable]);

  return (
    <TrackerContext.Provider
      value={{
        estados,
        estadosElectivas,
        notas,
        ppsHoras,
        setPpsHoras,
        perfil,
        setPerfil,
        metasExamen,
        setMetaExamen,
        removeMetaExamen,
        edgeMode,
        setEdgeMode,
        viewMode,
        setViewMode,
        gridFilter,
        setGridFilter,
        electivasOpen,
        setElectivasOpen,
        calendarOpen,
        setCalendarOpen,
        reportOpen,
        setReportOpen,
        profileModalOpen,
        setProfileModalOpen,
        focusedSubjectId,
        setFocusedSubjectId,
        selectedSubjectId,
        setSelectedSubjectId,
        toastMessage,
        showToast,
        toggleMateriaEstado,
        setEstadoDirecto,
        toggleElectivaEstado,
        setNotaMateria,
        puedeRegularMateria,
        puedeAprobarMateria,
        esMateriaCursable,
        esMateriaRendible,
        puedeRegularElectiva,
        esElectivaCursable,
        stats,
        resetAll,
        reloadProgress
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker debe usarse dentro de un TrackerProvider');
  }
  return context;
}
