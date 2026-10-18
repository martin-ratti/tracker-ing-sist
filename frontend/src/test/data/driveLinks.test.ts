import { describe, it, expect } from 'vitest';
import { 
  DRIVE_ROOT_URL, 
  DRIVE_ROOT_FOLDER_ID,
  DRIVE_INFO_GENERAL_URL,
  DRIVE_ELECTIVAS_ROOT_URL,
  DRIVE_NIVELES_IDS,
  DRIVE_MATERIAS_IDS,
  DRIVE_EXAMENES_IDS,
  getDriveUrlForNivel,
  getDriveUrlForMateria,
  getDriveUrlForExamenes,
  hasSpecificDriveFolder,
  hasSpecificDriveExamenesFolder
} from '../../data/driveLinks';

describe('Google Drive Links Data & Helpers (driveLinks.ts)', () => {
  it('debe tener definida la carpeta raíz y general de Google Drive', () => {
    expect(DRIVE_ROOT_FOLDER_ID).toBe('1ZgKML44drc8Wq3pcbHsc-ozPINv6xSHQ');
    expect(DRIVE_ROOT_URL).toContain(DRIVE_ROOT_FOLDER_ID);
    expect(DRIVE_INFO_GENERAL_URL).toContain('1IgdwoJZZHRks79Qkf-hj8iwsXyzZF7N5');
    expect(DRIVE_ELECTIVAS_ROOT_URL).toContain('1vGS_1MnCN-qtcHFcIP6ycEEaD8bXW5Nt');
  });

  it('debe mapear correctamente los 5 niveles a sus carpetas de Drive', () => {
    for (let nivel = 1; nivel <= 5; nivel++) {
      expect(DRIVE_NIVELES_IDS[nivel]).toBeDefined();
      const url = getDriveUrlForNivel(nivel);
      expect(url).toContain(DRIVE_NIVELES_IDS[nivel]);
    }
  });

  it('debe retornar la URL raíz si se consulta un nivel inexistente', () => {
    expect(getDriveUrlForNivel(99)).toBe(DRIVE_ROOT_URL);
  });

  it('debe resolver URLs para materias con carpeta específica', () => {
    // Análisis Matemático I (id: 1)
    expect(hasSpecificDriveFolder(1)).toBe(true);
    expect(getDriveUrlForMateria(1, 1)).toContain(DRIVE_MATERIAS_IDS[1]);

    // Algoritmos y Estructuras de Datos (id: 6)
    expect(hasSpecificDriveFolder(6)).toBe(true);
    expect(getDriveUrlForMateria(6)).toContain(DRIVE_MATERIAS_IDS[6]);

    // Seminario ADUSI (id: 99)
    expect(hasSpecificDriveFolder(99)).toBe(true);
    expect(getDriveUrlForMateria(99)).toContain(DRIVE_MATERIAS_IDS[99]);

    // Electiva JAVA (id: 207)
    expect(hasSpecificDriveFolder(207)).toBe(true);
    expect(getDriveUrlForMateria(207)).toContain(DRIVE_MATERIAS_IDS[207]);
  });

  it('debe hacer fallback al nivel si la materia no tiene carpeta específica', () => {
    // ID ficticio 999 con nivel 2
    expect(hasSpecificDriveFolder(999)).toBe(false);
    expect(getDriveUrlForMateria(999, 2)).toBe(getDriveUrlForNivel(2));
  });

  it('debe hacer fallback a la raíz si la materia y el nivel son desconocidos', () => {
    expect(getDriveUrlForMateria(999, 99)).toBe(DRIVE_ROOT_URL);
    expect(getDriveUrlForMateria(999)).toBe(DRIVE_ROOT_URL);
  });

  it('debe resolver URLs directas para subcarpetas de exámenes', () => {
    // Análisis Matemático I (id: 1)
    expect(hasSpecificDriveExamenesFolder(1)).toBe(true);
    expect(getDriveUrlForExamenes(1, 1)).toContain(DRIVE_EXAMENES_IDS[1]);

    // Algoritmos y Estructuras de Datos (id: 6)
    expect(hasSpecificDriveExamenesFolder(6)).toBe(true);
    expect(getDriveUrlForExamenes(6)).toContain(DRIVE_EXAMENES_IDS[6]);

    // Inteligencia Artificial (id: 31)
    expect(hasSpecificDriveExamenesFolder(31)).toBe(true);
    expect(getDriveUrlForExamenes(31, 5)).toContain(DRIVE_EXAMENES_IDS[31]);

    // Electiva Algoritmos Genéticos (id: 205)
    expect(hasSpecificDriveExamenesFolder(205)).toBe(true);
    expect(getDriveUrlForExamenes(205)).toContain(DRIVE_EXAMENES_IDS[205]);
  });

  it('debe hacer fallback a la carpeta de la materia si no tiene subcarpeta de exámenes', () => {
    // ID ficticio 999 con nivel 1
    expect(hasSpecificDriveExamenesFolder(999)).toBe(false);
    expect(getDriveUrlForExamenes(999, 1)).toBe(getDriveUrlForNivel(1));
  });
});
