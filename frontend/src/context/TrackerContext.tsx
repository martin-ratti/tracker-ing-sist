import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { EstadoMateria, Materia, Electiva, NotaMateria, ProgresoUsuario, PerfilAlumno, MetaExamen } from '../types/plan';
import { MATERIAS_MAP, ELECTIVAS_MAP } from '../data/plan2023';
import { fetchProgress, getLocalProgress, persistProgress, clearProgress, mergeProgress } from '../services/api';
import { decodeProgress } from '../utils/share';
import { subscribeToUserProgress, onFirebaseAuthStateChanged, isFirebaseConfigured } from '../services/firebase';
import { 
  UIContext, 
  UIProvider,
  useUI, 
  type UIContextType, 
  type GridFilterOption, 
  type ToastAction, 
  type ToastOptions, 
  type ToastItem 
} from './UIContext';
import {
  cumpleReqsCursada,
  puedeRegularMateria as checkPuedeRegular,
  puedeAprobarMateria as checkPuedeAprobar,
  esMateriaCursable as checkEsCursable,
  esMateriaRendible as checkEsRendible,
  puedeRegularElectiva as checkPuedeRegularElectiva,
  esElectivaCursable as checkEsElectivaCursable
} from '../utils/correlativesEngine';
import { applyCascade } from '../utils/cascadeEngine';
import {
  computeAcademicStats,
  type AcademicStats,
  type ProximaMetaInfo
} from '../utils/academicCalculations';
import { downloadBackupJson, parseBackupJson } from '../utils/backupManager';

export type { GridFilterOption, ToastAction, ToastOptions, ToastItem, UIContextType };
export { UIProvider, useUI };
export type { ProximaMetaInfo };
export type Stats = AcademicStats;

export interface AcademicTrackerContextType {
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
  isViewingShared: boolean;
  sharedName: string | null;
  exitSharedMode: () => void;
  importSharedProgress: () => void;
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
  exportBackupJson: () => void;
  importBackupJson: (jsonStr: string) => boolean;
}

export type TrackerContextType = AcademicTrackerContextType & UIContextType;

const TrackerContext = createContext<AcademicTrackerContextType | undefined>(undefined);

const AcademicTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estados, setEstados] = useState<Record<number, EstadoMateria>>(() => {
    if (typeof window !== 'undefined') return getLocalProgress().estados || {};
    return {};
  });
  const [estadosElectivas, setEstadosElectivas] = useState<Record<number, EstadoMateria>>(() => {
    if (typeof window !== 'undefined') return getLocalProgress().estadosElectivas || {};
    return {};
  });
  const [notas, setNotas] = useState<Record<number, NotaMateria>>(() => {
    if (typeof window !== 'undefined') return getLocalProgress().notas || {};
    return {};
  });
  const [ppsHoras, setPpsHorasState] = useState<number>(() => {
    if (typeof window !== 'undefined') return getLocalProgress().ppsHoras || 0;
    return 0;
  });
  const [perfil, setPerfilState] = useState<PerfilAlumno>(() => {
    if (typeof window !== 'undefined') return getLocalProgress().perfil || { nombre: '', legajo: '' };
    return { nombre: '', legajo: '' };
  });
  const [metasExamen, setMetasExamenState] = useState<Record<number, MetaExamen>>(() => {
    if (typeof window !== 'undefined') return getLocalProgress().metasExamen || {};
    return {};
  });
  const [isViewingShared, setIsViewingShared] = useState(false);
  const [sharedName, setSharedName] = useState<string | null>(null);

  const ui = useContext(UIContext);
  const showToast = useCallback((
    msg: string,
    variantOrOptions: 'success' | 'warning' | 'error' | 'info' | ToastOptions = 'info'
  ) => {
    if (ui?.showToast) {
      ui.showToast(msg, variantOrOptions);
    }
  }, [ui]);

  // Detect shared progress via URL hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        const code = hash.slice(7);
        const decoded = decodeProgress(code);
        if (decoded) {
          setEstados(decoded.estados);
          setEstadosElectivas(decoded.estadosElectivas);
          setPerfilState(decoded.perfil);
          setPpsHorasState(decoded.ppsHoras);
          setIsViewingShared(true);
          setSharedName(decoded.perfil.nombre || 'Compañero/a');
          return;
        }
      }
      setIsViewingShared(false);
      setSharedName(null);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Cargar estado inicial o al refrescar
  const reloadProgress = useCallback(() => {
    if (window.location.hash.startsWith('#share=')) return;
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

  const exitSharedMode = useCallback(() => {
    window.location.hash = '';
    setIsViewingShared(false);
    setSharedName(null);
    reloadProgress();
  }, [reloadProgress]);

  const importSharedProgress = useCallback(() => {
    void persistProgress({ estados, estadosElectivas, perfil, ppsHoras });
    window.location.hash = '';
    setIsViewingShared(false);
    setSharedName(null);
    showToast('✅ Progreso importado a tu cuenta', 'success');
  }, [estados, estadosElectivas, perfil, ppsHoras, showToast]);

  useEffect(() => {
    reloadProgress();
  }, [reloadProgress]);

  // Sincronización en tiempo real con Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let unsubscribeSnapshot: (() => void) | null = null;
    const unsubscribeAuth = onFirebaseAuthStateChanged((fbUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (fbUser) {
        unsubscribeSnapshot = subscribeToUserProgress(fbUser.uid, (data) => {
          if (window.location.hash.startsWith('#share=')) return;
          if (data) {
            const currentLocal = getLocalProgress();
            const merged = mergeProgress(currentLocal, data);
            setEstados(merged.estados || {});
            setEstadosElectivas(merged.estadosElectivas || {});
            setNotas(merged.notas || {});
            setPpsHorasState(merged.ppsHoras !== undefined ? merged.ppsHoras : 0);
            setPerfilState(merged.perfil || { nombre: '', legajo: '' });
            setMetasExamenState(merged.metasExamen || {});
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Helpers de acceso a estados
  const getEstado = useCallback((id: number): EstadoMateria => estados[id] || 'pendiente', [estados]);
  const getEstadoElectiva = useCallback((id: number): EstadoMateria => estadosElectivas[id] || 'pendiente', [estadosElectivas]);

  // Validaciones delegadas al motor puro
  const puedeRegularMateria = useCallback((m: Materia): boolean => checkPuedeRegular(m, getEstado), [getEstado]);
  const puedeAprobarMateria = useCallback((m: Materia): boolean => checkPuedeAprobar(m, getEstado), [getEstado]);
  const esMateriaCursable = useCallback((m: Materia): boolean => checkEsCursable(m, getEstado), [getEstado]);
  const esMateriaRendible = useCallback((m: Materia): boolean => checkEsRendible(m, getEstado), [getEstado]);
  const puedeRegularElectiva = useCallback((e: Electiva): boolean => checkPuedeRegularElectiva(e, getEstado), [getEstado]);
  const esElectivaCursable = useCallback((e: Electiva): boolean => checkEsElectivaCursable(e, getEstadoElectiva, getEstado), [getEstadoElectiva, getEstado]);

  // Alternar estado de una materia
  const toggleMateriaEstado = useCallback((id: number) => {
    if (isViewingShared) {
      showToast('⚠️ Estás en modo de solo lectura del progreso compartido', 'warning');
      return;
    }
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
    void persistProgress({ estados: nextEstados, estadosElectivas: nextElectivas });
  }, [estados, estadosElectivas, getEstado, puedeRegularMateria, puedeAprobarMateria, showToast, isViewingShared]);

  // Establecer un estado directo sin ciclo toggle
  const setEstadoDirecto = useCallback((id: number, estado: EstadoMateria) => {
    if (isViewingShared) {
      showToast('⚠️ Estás en modo de solo lectura del progreso compartido', 'warning');
      return;
    }
    const m = MATERIAS_MAP[id];
    if (!m) return;

    if (estado === 'regular' && !puedeRegularMateria(m)) {
      showToast(`⚠️ No cumples las correlativas para regularizar ${m.nombre}`);
      return;
    }

    if (estado === 'aprobada') {
      if (!cumpleReqsCursada(m, getEstado)) {
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
    void persistProgress({ estados: nextEstados, estadosElectivas: nextElectivas, notas, ppsHoras });
  }, [estados, estadosElectivas, notas, ppsHoras, getEstado, puedeRegularMateria, puedeAprobarMateria, showToast, isViewingShared]);

  // Alternar estado de una electiva
  const toggleElectivaEstado = useCallback((id: number) => {
    if (isViewingShared) {
      showToast('⚠️ Estás en modo de solo lectura del progreso compartido', 'warning');
      return;
    }
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
    void persistProgress({ estadosElectivas: nextElectivas });
  }, [estadosElectivas, getEstadoElectiva, puedeRegularElectiva, getEstado, showToast, isViewingShared]);

  const setNotaMateria = useCallback((id: number, notaData: NotaMateria) => {
    setNotas(prev => {
      const next = { ...prev, [id]: notaData };
      void persistProgress({ notas: next });
      return next;
    });
  }, []);

  const setPpsHoras = useCallback((hs: number) => {
    setPpsHorasState(hs);
    void persistProgress({ ppsHoras: hs });
  }, []);

  const setPerfil = useCallback((p: PerfilAlumno) => {
    setPerfilState(p);
    void persistProgress({ perfil: p });
  }, []);

  const setMetaExamen = useCallback((materiaId: number, meta: MetaExamen) => {
    setMetasExamenState(prev => {
      const next = { ...prev, [materiaId]: meta };
      void persistProgress({ metasExamen: next });
      return next;
    });
    showToast(`🎯 Meta agendada: ${meta.turnoNombre}`);
  }, [showToast]);

  const removeMetaExamen = useCallback((materiaId: number) => {
    setMetasExamenState(prev => {
      const next = { ...prev };
      delete next[materiaId];
      void persistProgress({ metasExamen: next });
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
    void clearProgress();
    showToast('Plan reseteado por completo.');
  }, [showToast]);

  // Cálculo de estadísticas académicas delegado
  const stats: Stats = useMemo(() => {
    return computeAcademicStats(
      estados,
      estadosElectivas,
      notas,
      ppsHoras,
      metasExamen,
      esMateriaCursable
    );
  }, [estados, estadosElectivas, notas, ppsHoras, metasExamen, esMateriaCursable]);

  const exportBackupJson = useCallback(() => {
    downloadBackupJson(estados, estadosElectivas, notas, ppsHoras, perfil, metasExamen);
    showToast('💾 Copia de seguridad exportada con éxito', 'success');
  }, [estados, estadosElectivas, notas, ppsHoras, perfil, metasExamen, showToast]);

  const importBackupJson = useCallback((jsonStr: string): boolean => {
    const data = parseBackupJson(jsonStr);
    if (!data) {
      showToast('❌ Error al procesar el archivo JSON', 'error');
      return false;
    }

    const newEstados = data.estados && typeof data.estados === 'object' ? data.estados : estados;
    const newElectivas = data.estadosElectivas && typeof data.estadosElectivas === 'object' ? data.estadosElectivas : estadosElectivas;
    const newNotas = data.notas && typeof data.notas === 'object' ? data.notas : notas;
    const newPps = typeof data.ppsHoras === 'number' ? data.ppsHoras : ppsHoras;
    const newPerfil = data.perfil && typeof data.perfil === 'object' ? data.perfil : perfil;
    const newMetas = data.metasExamen && typeof data.metasExamen === 'object' ? data.metasExamen : metasExamen;

    setEstados(newEstados);
    setEstadosElectivas(newElectivas);
    setNotas(newNotas);
    setPpsHorasState(newPps);
    setPerfilState(newPerfil);
    setMetasExamenState(newMetas);

    void persistProgress({
      estados: newEstados,
      estadosElectivas: newElectivas,
      notas: newNotas,
      ppsHoras: newPps,
      perfil: newPerfil,
      metasExamen: newMetas
    });

    showToast('✅ ¡Progreso restaurado correctamente!', 'success');
    return true;
  }, [estados, estadosElectivas, notas, ppsHoras, perfil, metasExamen, showToast]);

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
        isViewingShared,
        sharedName,
        exitSharedMode,
        importSharedProgress,
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
        reloadProgress,
        exportBackupJson,
        importBackupJson
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const existingUI = useContext(UIContext);
  if (existingUI) {
    return <AcademicTrackerProvider>{children}</AcademicTrackerProvider>;
  }
  return (
    <UIProvider>
      <AcademicTrackerProvider>{children}</AcademicTrackerProvider>
    </UIProvider>
  );
};

export function useAcademicTracker(): AcademicTrackerContextType {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useAcademicTracker debe usarse dentro de un TrackerProvider');
  }
  return context;
}

export function useTracker(): TrackerContextType {
  const tracker = useContext(TrackerContext);
  if (!tracker) {
    throw new Error('useTracker debe usarse dentro de un TrackerProvider');
  }
  const ui = useContext(UIContext);
  if (!ui) {
    throw new Error('useTracker debe usarse dentro de un TrackerProvider');
  }
  return { ...ui, ...tracker };
}
