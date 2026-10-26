import type { EstadoMateria, NotaMateria, PerfilAlumno, MetaExamen, MetaGlobalizador } from '../types/plan';

export interface BackupPayload {
  version: string;
  exportDate: string;
  plan: string;
  estados: Record<number, EstadoMateria>;
  estadosElectivas: Record<number, EstadoMateria>;
  notas: Record<number, NotaMateria>;
  ppsHoras: number;
  perfil: PerfilAlumno;
  metasExamen: Record<number, MetaExamen>;
  metasGlobalizador?: Record<number, MetaGlobalizador>;
}

/**
 * Genera y descarga un archivo JSON con la copia de seguridad completa del progreso.
 */
export function downloadBackupJson(
  estados: Record<number, EstadoMateria>,
  estadosElectivas: Record<number, EstadoMateria>,
  notas: Record<number, NotaMateria>,
  ppsHoras: number,
  perfil: PerfilAlumno,
  metasExamen: Record<number, MetaExamen>,
  metasGlobalizador?: Record<number, MetaGlobalizador>
): void {
  const backupData: BackupPayload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    plan: 'Plan 2023 ISI UTN FRRo',
    estados,
    estadosElectivas,
    notas,
    ppsHoras,
    perfil,
    metasExamen,
    metasGlobalizador
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `tracker-isi-${perfil.legajo || 'backup'}-${new Date().toISOString().slice(0, 10)}.json`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Parsea y valida el contenido de un archivo JSON de respaldo.
 * Devuelve el payload normalizado o null si es inválido.
 */
export function parseBackupJson(jsonStr: string): Partial<BackupPayload> | null {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') {
      return null;
    }
    return data as Partial<BackupPayload>;
  } catch {
    return null;
  }
}
