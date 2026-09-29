import type { EstadoMateria, PerfilAlumno } from '../types/plan';

export interface SharedData {
  estados: Record<number, EstadoMateria>;
  estadosElectivas: Record<number, EstadoMateria>;
  perfil: PerfilAlumno;
  ppsHoras: number;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export function encodeProgress(data: SharedData): string {
  const stMap: Record<string, number> = { regular: 1, aprobada: 2 };
  const troncales: [number, number][] = [];
  for (const [k, v] of Object.entries(data.estados || {})) {
    if (stMap[v]) troncales.push([Number(k), stMap[v]]);
  }

  const electivas: [number, number][] = [];
  for (const [k, v] of Object.entries(data.estadosElectivas || {})) {
    if (stMap[v]) electivas.push([Number(k), stMap[v]]);
  }

  const compact = {
    t: troncales,
    e: electivas,
    p: data.perfil?.nombre ? data.perfil.nombre : undefined,
    pps: data.ppsHoras > 0 ? data.ppsHoras : undefined
  };

  const jsonStr = JSON.stringify(compact);
  const bytes = new TextEncoder().encode(jsonStr);
  let base64 = bytesToBase64(bytes)
    .replaceAll('+', '-')
    .replaceAll('/', '_');
  while (base64.endsWith('=')) {
    base64 = base64.slice(0, -1);
  }
  return base64;
}

export function decodeProgress(hashStr: string): SharedData | null {
  try {
    let base64 = hashStr.replaceAll('-', '+').replaceAll('_', '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const bytes = base64ToBytes(base64);
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr);

    const estados: Record<number, EstadoMateria> = {};
    if (Array.isArray(parsed.t)) {
      parsed.t.forEach(([id, st]: [number, number]) => {
        estados[id] = st === 2 ? 'aprobada' : 'regular';
      });
    }

    const estadosElectivas: Record<number, EstadoMateria> = {};
    if (Array.isArray(parsed.e)) {
      parsed.e.forEach(([id, st]: [number, number]) => {
        estadosElectivas[id] = st === 2 ? 'aprobada' : 'regular';
      });
    }

    return {
      estados,
      estadosElectivas,
      perfil: { nombre: parsed.p || 'Estudiante', legajo: '' },
      ppsHoras: typeof parsed.pps === 'number' ? parsed.pps : 0
    };
  } catch (err) {
    console.error('Error al decodificar progreso compartido:', err);
    return null;
  }
}
