import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProgress, saveProgress, resetProgress } from '../storage/progressStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const PROGRESS_USERS_DIR = path.join(DATA_DIR, 'progress');
const DEFAULT_FILE = path.join(DATA_DIR, 'progress.json');

describe('progressStore', () => {
  const testUserId = 'test-unit-user';
  const testUserFile = path.join(PROGRESS_USERS_DIR, `${testUserId}.json`);

  beforeEach(() => {
    if (fs.existsSync(DEFAULT_FILE)) fs.unlinkSync(DEFAULT_FILE);
    if (fs.existsSync(testUserFile)) fs.unlinkSync(testUserFile);
  });

  it('debe devolver progreso por defecto cuando el archivo no existe', () => {
    const anonProg = getProgress();
    expect(anonProg.estados).toEqual({});
    expect(anonProg.ppsHoras).toBe(0);
    expect(anonProg.actualizadoEn).toBeDefined();

    const userProg = getProgress(testUserId);
    expect(userProg.estados).toEqual({});
  });

  it('debe guardar y actualizar parcialmente el progreso', () => {
    saveProgress({ estados: { 1: 'aprobada' }, ppsHoras: 50 }, testUserId);

    const saved = getProgress(testUserId);
    expect(saved.estados[1]).toBe('aprobada');
    expect(saved.ppsHoras).toBe(50);

    // Actualización parcial subsecuente
    saveProgress({ ppsHoras: 100 }, testUserId);
    const updated = getProgress(testUserId);
    expect(updated.estados[1]).toBe('aprobada');
    expect(updated.ppsHoras).toBe(100);
  });

  it('debe reiniciar el progreso a valores vacíos', () => {
    saveProgress({ estados: { 2: 'regular' }, ppsHoras: 80 }, testUserId);
    expect(getProgress(testUserId).ppsHoras).toBe(80);

    const reset = resetProgress(testUserId);
    expect(reset.estados).toEqual({});
    expect(reset.ppsHoras).toBe(0);
  });

  it('debe recuperarse ante un archivo JSON corrupto devolviendo progreso por defecto', () => {
    fs.mkdirSync(PROGRESS_USERS_DIR, { recursive: true });
    fs.writeFileSync(testUserFile, 'JSON_CORRUPTO_TOTALMENTE_INVALIDO', 'utf-8');

    const result = getProgress(testUserId);
    expect(result.estados).toEqual({});
    expect(result.ppsHoras).toBe(0);
  });
});
