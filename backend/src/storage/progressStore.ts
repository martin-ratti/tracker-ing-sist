import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProgresoUsuario } from '../types/plan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const PROGRESS_USERS_DIR = path.join(DATA_DIR, 'progress');
const DEFAULT_FILE = path.join(DATA_DIR, 'progress.json');

function buildDefault(): ProgresoUsuario {
  return {
    estados: {},
    estadosElectivas: {},
    notas: {},
    ppsHoras: 0,
    perfil: { nombre: '', legajo: '' },
    metasExamen: {},
    actualizadoEn: new Date().toISOString()
  };
}

function ensureDirExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getFilePath(userId?: string): string {
  if (userId) {
    ensureDirExists(PROGRESS_USERS_DIR);
    // Sanear userId para evitar path traversal
    const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
    return path.join(PROGRESS_USERS_DIR, `${safeId}.json`);
  }
  ensureDirExists(DATA_DIR);
  return DEFAULT_FILE;
}

function writeFile(filePath: string, data: ProgresoUsuario): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getProgress(userId?: string): ProgresoUsuario {
  const file = getFilePath(userId);
  if (!fs.existsSync(file)) {
    const defaultProgress = buildDefault();
    writeFile(file, defaultProgress);
    return defaultProgress;
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw) as ProgresoUsuario;
  } catch (error) {
    console.error(`Error al leer progreso de ${userId ?? 'anon'}, usando default:`, error);
    return buildDefault();
  }
}

export function saveProgress(progress: Partial<ProgresoUsuario>, userId?: string): ProgresoUsuario {
  const current = getProgress(userId);
  const updated: ProgresoUsuario = {
    ...current,
    ...progress,
    actualizadoEn: new Date().toISOString()
  };
  const file = getFilePath(userId);
  writeFile(file, updated);
  return updated;
}

export function resetProgress(userId?: string): ProgresoUsuario {
  const fresh = buildDefault();
  const file = getFilePath(userId);
  writeFile(file, fresh);
  return fresh;
}
