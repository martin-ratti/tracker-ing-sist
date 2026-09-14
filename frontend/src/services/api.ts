import type { ProgresoUsuario, PlanData } from '../types/plan';

const LOCAL_STORAGE_KEY = 'utn-sistemas-tracker-2023';

export async function fetchPlan(): Promise<PlanData | null> {
  try {
    const res = await fetch('/api/plan');
    if (!res.ok) throw new Error('Error al obtener plan desde backend');
    return await res.json();
  } catch (error) {
    console.warn('Backend no disponible para /api/plan, usando datos locales:', error);
    return null;
  }
}

export async function fetchProgress(): Promise<ProgresoUsuario> {
  // Intentar cargar desde backend
  try {
    const res = await fetch('/api/progress');
    if (res.ok) {
      const data: ProgresoUsuario = await res.json();
      // Guardar también en localStorage para modo offline
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.warn('Backend no disponible, cargando desde localStorage:', error);
  }

  // Fallback a localStorage
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // Ignorar error de parseo
    }
  }

  return {
    estados: {},
    estadosElectivas: {},
    notas: {},
    ppsHoras: 0
  };
}

let saveTimeout: any = null;

export async function persistProgress(progress: Partial<ProgresoUsuario>): Promise<void> {
  // Guardar inmediatamente en localStorage
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  const current: ProgresoUsuario = local ? JSON.parse(local) : { estados: {}, estadosElectivas: {}, notas: {}, ppsHoras: 0 };
  const updated: ProgresoUsuario = {
    ...current,
    ...progress,
    actualizadoEn: new Date().toISOString()
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  // Enviar a backend con debounce
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.warn('No se pudo sincronizar con backend (offline):', err);
    }
  }, 400);
}

export async function clearProgress(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  try {
    await fetch('/api/progress/reset', { method: 'POST' });
  } catch (err) {
    console.warn('No se pudo resetear en backend:', err);
  }
}
