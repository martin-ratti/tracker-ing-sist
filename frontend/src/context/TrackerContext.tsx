import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { EstadoMateria, Materia, Electiva, NotaMateria, ProgresoUsuario, PerfilAlumno, MetaExamen } from '../types/plan';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS, MATERIAS_MAP, ELECTIVAS_MAP } from '../data/plan2023';
import { TURNOS_EXAMEN_2026, getFechaExactaMesa } from '../data/calendario2026';
import { fetchProgress, getLocalProgress, persistProgress, clearProgress } from '../services/api';
import { decodeProgress } from '../utils/share';
import { subscribeToUserProgress, onFirebaseAuthStateChanged, isFirebaseConfigured } from '../services/firebase';

export type GridFilterOption = 'todas' | 'cursables' | 'regulares' | 'aprobadas' | 'con-meta';

export interface ProximaMetaInfo {
  materiaId: number;
  materiaNombre: string;
  materiaNombreCorto: string;
  turnoNombre: string;
  fechaExamenStr: string;
  diasFaltantes: number;
  urgencia: 'urgente' | 'proxima' | 'lejana';
}

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
  proximaMeta: ProximaMetaInfo | null;
}

export interface ToastItem {
  id: string;
  message: string;
  variant: 'success' | 'warning' | 'error' | 'info';
  duration: number;
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
  statsModalOpen: boolean;
  setStatsModalOpen: (open: boolean) => void;
  shareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;
  isViewingShared: boolean;
  sharedName: string | null;
  exitSharedMode: () => void;
  importSharedProgress: () => void;
  focusedSubjectId: number | null;
  setFocusedSubjectId: (id: number | null) => void;
  selectedSubjectId: number | null;
  setSelectedSubjectId: (id: number | null) => void;
  toastMessage: string | null;
  toasts: ToastItem[];
  showToast: (msg: string, variant?: 'success' | 'warning' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
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
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  mobileDrawerView: 'menu' | 'electivas';
  setMobileDrawerView: (view: 'menu' | 'electivas') => void;
  openMobileDrawer: (view?: 'menu' | 'electivas') => void;
  closeMobileDrawer: () => void;
  dimApproved: boolean;
  setDimApproved: React.Dispatch<React.SetStateAction<boolean>>;
  criticalChainActive: boolean;
  setCriticalChainActive: React.Dispatch<React.SetStateAction<boolean>>;
  exportBackupJson: () => void;
  importBackupJson: (jsonStr: string) => boolean;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estados, setEstados] = useState<Record<number, EstadoMateria>>(() => {
    if (typeof window !== 'undefined') {
      return getLocalProgress().estados || {};
    }
    return {};
  });
  const [estadosElectivas, setEstadosElectivas] = useState<Record<number, EstadoMateria>>(() => {
    if (typeof window !== 'undefined') {
      return getLocalProgress().estadosElectivas || {};
    }
    return {};
  });
  const [notas, setNotas] = useState<Record<number, NotaMateria>>(() => {
    if (typeof window !== 'undefined') {
      return getLocalProgress().notas || {};
    }
    return {};
  });
  const [ppsHoras, setPpsHorasState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return getLocalProgress().ppsHoras || 0;
    }
    return 0;
  });
  const [perfil, setPerfilState] = useState<PerfilAlumno>(() => {
    if (typeof window !== 'undefined') {
      return getLocalProgress().perfil || { nombre: '', legajo: '' };
    }
    return { nombre: '', legajo: '' };
  });
  const [metasExamen, setMetasExamenState] = useState<Record<number, MetaExamen>>(() => {
    if (typeof window !== 'undefined') {
      return getLocalProgress().metasExamen || {};
    }
    return {};
  });
  const [gridFilter, setGridFilter] = useState<GridFilterOption>('todas');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isViewingShared, setIsViewingShared] = useState(false);
  const [sharedName, setSharedName] = useState<string | null>(null);
  const [focusedSubjectId, setFocusedSubjectId] = useState<number | null>(null);
  const [edgeMode, setEdgeMode] = useState<'ambos' | 'regular' | 'aprobada'>('ambos');
  const [viewMode, setViewMode] = useState<'grafo' | 'malla'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'malla';
    }
    return 'grafo';
  });
  const [electivasOpen, setElectivasOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileDrawerView, setMobileDrawerView] = useState<'menu' | 'electivas'>('menu');
  const [dimApproved, setDimApproved] = useState(false);
  const [criticalChainActive, setCriticalChainActive] = useState(false);

  const openMobileDrawer = useCallback((view: 'menu' | 'electivas' = 'menu') => {
    setMobileDrawerView(view);
    setMobileDrawerOpen(true);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  const toastMessage = toasts.length > 0 ? toasts[0].message : null;

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((msg: string, variant: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    if (!msg) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = 3500;
    setToasts(prev => {
      const next = [...prev, { id, message: msg, variant, duration }];
      return next.slice(-3);
    });
  }, []);

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

  // Cargar estado
  const reloadProgress = useCallback(() => {
    if (window.location.hash.startsWith('#share=')) {
      return;
    }
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

  const importSharedProgress = useCallback(() => {
    persistProgress({
      estados,
      estadosElectivas,
      perfil,
      ppsHoras
    });
    window.location.hash = '';
    setIsViewingShared(false);
    setSharedName(null);
    showToast('✅ Progreso importado a tu cuenta', 'success');
  }, [estados, estadosElectivas, perfil, ppsHoras, showToast]);

  useEffect(() => {
    reloadProgress();
  }, [reloadProgress]);

  // Sincronización en tiempo real con Firestore para multidispositivo
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
            setEstados(data.estados || {});
            setEstadosElectivas(data.estadosElectivas || {});
            setNotas(data.notas || {});
            setPpsHorasState(data.ppsHoras !== undefined ? data.ppsHoras : 0);
            setPerfilState(data.perfil || { nombre: '', legajo: '' });
            setMetasExamenState(data.metasExamen || {});
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

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
    persistProgress({ estados: nextEstados, estadosElectivas: nextElectivas });
  }, [estados, estadosElectivas, getEstado, puedeRegularMateria, puedeAprobarMateria, showToast, applyCascade, isViewingShared]);

  // Establecer un estado concreto sin pasar por el ciclo de toggle
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
  }, [estados, estadosElectivas, notas, ppsHoras, applyCascade, puedeRegularMateria, puedeAprobarMateria, cumpleReqsCursada, showToast, isViewingShared]);

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
    persistProgress({ estadosElectivas: nextElectivas });
  }, [estadosElectivas, getEstadoElectiva, puedeRegularElectiva, getEstado, showToast, isViewingShared]);

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

    // Ponderación de Ingeniería: 90% Materias Troncales (36 troncales), 5% Electivas (20 hs) y 5% PPS (200 hs)
    const progresoTroncales = totalTroncales > 0 ? (aprobadas / totalTroncales) * 90 : 0;
    const progresoElectivas = (Math.min(horasElectivasAprobadas, 20) / 20) * 5;
    const progresoPPS = (Math.min(ppsHoras, 200) / 200) * 5;
    const ingenieroProgreso = Math.min(100, Math.round(progresoTroncales + progresoElectivas + progresoPPS));

    const ingenieroCumplido = todasTroncalesOk && ingElectivasOk && ppsOk;
    const metasCount = Object.keys(metasExamen).length;

    // Próxima meta de examen más cercana (Item 17)
    let proximaMeta: ProximaMetaInfo | null = null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const metasArray = Object.values(metasExamen);
    if (metasArray.length > 0) {
      const metasFuturas: ProximaMetaInfo[] = [];

      for (const meta of metasArray) {
        if (getEstado(meta.materiaId) === 'aprobada') continue;

        const materia = MATERIAS_MAP[meta.materiaId];
        let fechaStr = meta.fechaEstimada;

        if (!fechaStr) {
          const turno = TURNOS_EXAMEN_2026.find(t => t.id === meta.turnoId);
          if (turno) {
            const fechaExacta = getFechaExactaMesa(meta.materiaId, turno);
            fechaStr = fechaExacta ? fechaExacta.fechaExactaStr : turno.fechaInicio;
          }
        }

        if (fechaStr) {
          const target = new Date(fechaStr + 'T00:00:00');
          const diffMs = target.getTime() - now.getTime();
          const diasFaltantes = Math.round(diffMs / (1000 * 60 * 60 * 24));

          if (diasFaltantes >= 0) {
            const urgencia: 'urgente' | 'proxima' | 'lejana' =
              diasFaltantes <= 7 ? 'urgente' : diasFaltantes <= 30 ? 'proxima' : 'lejana';

            metasFuturas.push({
              materiaId: meta.materiaId,
              materiaNombre: materia ? materia.nombreCompleto : `Materia #${meta.materiaId}`,
              materiaNombreCorto: materia ? materia.nombre : `#${meta.materiaId}`,
              turnoNombre: meta.turnoNombre,
              fechaExamenStr: fechaStr,
              diasFaltantes,
              urgencia
            });
          }
        }
      }

      metasFuturas.sort((a, b) => a.diasFaltantes - b.diasFaltantes);
      if (metasFuturas.length > 0) {
        proximaMeta = metasFuturas[0];
      }
    }

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
      metasCount,
      proximaMeta
    };
  }, [getEstado, getEstadoElectiva, notas, ppsHoras, metasExamen, esMateriaCursable]);

  const exportBackupJson = useCallback(() => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      plan: 'Plan 2023 ISI UTN FRRo',
      estados,
      estadosElectivas,
      notas,
      ppsHoras,
      perfil,
      metasExamen
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `tracker-isi-${perfil.legajo || 'backup'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 Copia de seguridad exportada con éxito', 'success');
  }, [estados, estadosElectivas, notas, ppsHoras, perfil, metasExamen, showToast]);

  const importBackupJson = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        showToast('⚠️ Archivo de copia de seguridad no válido', 'error');
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

      persistProgress({
        estados: newEstados,
        estadosElectivas: newElectivas,
        notas: newNotas,
        ppsHoras: newPps,
        perfil: newPerfil,
        metasExamen: newMetas
      });

      showToast('✅ ¡Progreso restaurado correctamente!', 'success');
      return true;
    } catch {
      showToast('❌ Error al procesar el archivo JSON', 'error');
      return false;
    }
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
        statsModalOpen,
        setStatsModalOpen,
        shareModalOpen,
        setShareModalOpen,
        isViewingShared,
        sharedName,
        exitSharedMode,
        importSharedProgress,
        focusedSubjectId,
        setFocusedSubjectId,
        selectedSubjectId,
        setSelectedSubjectId,
        toastMessage,
        toasts,
        showToast,
        dismissToast,
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
        mobileDrawerOpen,
        setMobileDrawerOpen,
        mobileDrawerView,
        setMobileDrawerView,
        openMobileDrawer,
        closeMobileDrawer,
        dimApproved,
        setDimApproved,
        criticalChainActive,
        setCriticalChainActive,
        exportBackupJson,
        importBackupJson
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
