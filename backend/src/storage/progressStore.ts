import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProgresoUsuario } from '../types/plan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'progress.json');

const DEFAULT_PROGRESS: ProgresoUsuario = {
  estados: {},
  estadosElectivas: {},
  notas: {},
  ppsHoras: 0,
  actualizadoEn: new Date().toISOString()
};

function ensureDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getProgress(): ProgresoUsuario {
  ensureDirExists();
  if (!fs.existsSync(DATA_FILE)) {
    saveProgress(DEFAULT_PROGRESS);
    return DEFAULT_PROGRESS;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al leer progress.json, usando predeterminado:', error);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: Partial<ProgresoUsuario>): ProgresoUsuario {
  ensureDirExists();
  const current = getProgress();
  const updated: ProgresoUsuario = {
    ...current,
    ...progress,
    actualizadoEn: new Date().toISOString()
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function resetProgress(): ProgresoUsuario {
  return saveProgress(DEFAULT_PROGRESS);
}
