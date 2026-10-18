/**
 * Mapeo oficial de enlaces a Google Drive del Tracker UTN Sistemas FRRo (Plan 2023)
 * Contiene los identificadores y URLs directas para carpetas generales, años académicos,
 * materias troncales y materias electivas.
 */

export const DRIVE_ROOT_FOLDER_ID = '1ZgKML44drc8Wq3pcbHsc-ozPINv6xSHQ';
export const DRIVE_ROOT_URL = `https://drive.google.com/drive/folders/${DRIVE_ROOT_FOLDER_ID}`;

export const DRIVE_INFO_GENERAL_ID = '1IgdwoJZZHRks79Qkf-hj8iwsXyzZF7N5';
export const DRIVE_INFO_GENERAL_URL = `https://drive.google.com/drive/folders/${DRIVE_INFO_GENERAL_ID}`;

export const DRIVE_ELECTIVAS_ROOT_ID = '1vGS_1MnCN-qtcHFcIP6ycEEaD8bXW5Nt';
export const DRIVE_ELECTIVAS_ROOT_URL = `https://drive.google.com/drive/folders/${DRIVE_ELECTIVAS_ROOT_ID}`;

/**
 * Carpetas de Google Drive correspondientes a cada año / nivel de la carrera
 */
export const DRIVE_NIVELES_IDS: Record<number, string> = {
  1: '1wCx9qoqdpc46ds3F9fZOxgcPa2i24pmT', // 1° AÑO
  2: '1V_97juWpHdc2HdS2t_Oj9qDwzkxLlJNs', // 2° AÑO
  3: '1-w6Dwxp8YlQ_9A15ihfd6_nvcfEET9EV', // 3º AÑO
  4: '14EPGaj5qPLykxNyb1atAVub5_Ljz4vSM', // 4º AÑO
  5: '1MWZ1Z0onETrJj2VLcNY0bJhLNcnRh61a', // 5º AÑO
};

/**
 * Mapeo de IDs de materias troncales y electivas a su carpeta correspondiente de Google Drive
 */
export const DRIVE_MATERIAS_IDS: Record<number, string> = {
  // 1ER NIVEL
  1: '1csy9v-e0PYzr25ZxLOo3KjvNyNiEfB77', // Análisis Matemático I
  2: '1kTbPNWXiIPsYhZ_ICxX7tSxwnoY8dqRS', // Álgebra y Geometría Analítica
  3: '13VYj5SMUpeffAaT0tjqohm_Q7bPSmcjd', // Física I
  4: '1MrBE1Jt_ESJMCh1Xfbw-_yZa8YBYovWd', // Inglés I
  5: '1R1w-XnPeghaEW1zyonibY8RnDHqJj_WG', // Lógica y Estructuras Discretas
  6: '1tY1mj4jWvLqYfPNH0Hx-17emjAyyIlRh', // Algoritmos y Estructuras de Datos
  7: '1dP28w4mC0O-0bL8nT2WViJmAgWxdF7Z5', // Arquitectura de Computadoras
  8: '1bk7xBX2zRqySVYydf5IPkswq9BPdYnpm', // Sistemas y Procesos de Negocio

  // 2DO NIVEL
  9: '1OiD7-bcl-jND1gWsrgktljC2m9jP72M8',  // Análisis Matemático II
  10: '14whfm4KIDPqYgy3o_wqtN4K_sUG7MXNX', // Física II
  11: '1V-QfFznBzNwUVzWgURqLYvRBMOq_Mxz4', // Ingeniería y Sociedad
  12: '10XtuY3ND_g2iI6-PoVtc99WYugjMXoIz', // Inglés II
  13: '1O497vyRnpOInFPmVzkx5Ey_4GKhPoweX', // Sintaxis y Semántica de los Lenguajes
  14: '1e_dWVywF2oq656X3aj-IL215w8LOJDxu', // Paradigmas de Programación
  15: '1JkI0lsxgU-c6zl4igSH2ujJJCl0z4kbA', // Sistemas Operativos
  16: '15GIEQWSFw9-AGx7MM8YLiZFu_EdfS9gY', // Análisis de Sistemas de Información

  // 3ER NIVEL
  17: '16GOflZM7fyfR_o09aaCSVOWmZhmdQ3ee', // Probabilidad y Estadística
  18: '19DVQ9JDI06roM18ghY32-CCqAM8ezJpP', // Economía
  19: '1r9c1L-gtM-KdfJ-seoI_1M3EQeFLnG9W', // Base de Datos
  20: '1B8uwYCVmMp7e4_gSCSq7hN3_95rz_QyQ', // Desarrollo de Software
  21: '1C0S_oyZCdtVUfv_EFP4pJjQrNLNSToUu', // Comunicación de Datos
  22: '1nJM8BYl74uZBjHvKsswjgNYvak8vJ7h7', // Análisis Numérico
  23: '1RPScyimY3NeOp_cQMSKkhNohcXBJlis5', // Diseño de Sistemas de Información
  99: '11XsqSGDLpAeVb0jtpdAvtt56Rr1fSclq', // Seminario Integrador (ADUSI)

  // 4TO NIVEL
  24: '1kA9pJ6aVZwHTcaW2dhJQveGcnQVtAy0k', // Legislación
  25: '1VJJ04eHB8hRrZriCKJ-Ha1EodwLhi2f3', // Ingeniería y Calidad de Software
  26: '1e5MZUFocfXBkwDw7E33NTQjwXQBNPBay', // Redes de Datos
  27: '1qY_d4w0BAVVBiVDc68kslUSCluP7EkWn', // Investigación Operativa
  28: '1F9-Ml_ppaLDSGrxLoO1kmz39XGxtEl-9', // Simulación
  29: '1NhoZw0orcdC-8Aw1c9lGfrQBa5zqxSdP', // Tecnologías para la Automatización
  30: '1B2f0wTl1kiPOjN-b4exhyz3JDzuZZw9C', // Administración de Sistemas de Información

  // 5TO NIVEL
  31: '1po8_0RCI5GvynT_1BxqXOHxhHz6LcUDY', // Inteligencia Artificial
  32: '1MgYeOgMVLA54RJc0SwDmLOPcVOD5vgny', // Ciencia de Datos
  33: '1JEF2SwPjW7qSpA-O-0THpbmnpGqf0HBN', // Sistemas de Gestión
  34: '1r_4JxJfaDBBp4fILz5J35kqySinX5whX', // Gestión Gerencial
  35: '1AkGd0yGhkbdS6i4UGduE4sbr2gX0qb2o', // Seguridad en los Sistemas de Información
  36: '1MWZ1Z0onETrJj2VLcNY0bJhLNcnRh61a', // Proyecto Final (Carpeta de 5º Año)

  // ELECTIVAS
  201: '1QiD4f88yWNF3XB6DjHhAemjz9SkWDbGW', // Entornos Gráficos
  202: '13X6R4sApmRoqyH-CYnVNig0cSkncfpYH', // Análisis y Diseño de Datos e Información
  203: '1ij4yb3EW5SR9q88-dc8nX78rTGBvvKBm', // Sistemas de Información Geográfica
  205: '1zSR2VefOgJxesNPHA9Y-IWsxwEmK94JC', // Algoritmos Genéticos
  206: '13QNPg-uOyjbhksNTaSGCqIb--K573Hni', // Informática Jurídica
  207: '1Im--7mlA9x2rYdOIvzEOBwgrfZOm4VZ-', // Lenguaje de Programación JAVA
  208: '1mlet5HurcmKZmG_ja7OVD1pRX_xOXRvN', // Tecnologías de Desarrollo de Software IDE (.NET)
  209: '1ISiKbUMSVh1B470JR-NnOGxOzP9YHXFk', // Gestión Ingenieril
  210: '1ofC3BJb8651rZIN6nvlS6nesNMhdQR3l', // Introducción a la Práctica Profesional
  211: '12ZhYYermN5IQFsIYW0AdYR5RY2S7BWZa', // Química Aplicada a la Informática
  212: '1UJgJ8JwIFAyJ1714765mf9mx99opQxYh', // Infraestructura Tecnológica
  213: '1rGbGb7_Vspbf98t-ggGYeP08QGIGxF9n', // Soporte a la Gestión de Datos con Programación Visual
  214: '1x5NnBzAIsO4P5rxym8bhsF0Zer2CLEm9', // Metodología de la Investigación
  217: '1gU7lw6S_L8OZzAIPBiF_RFVT6BPs0Cpw', // Dirección de Recursos Humanos
};

/**
 * Mapeo de IDs de materias a su subcarpeta específica de "Exámenes" / "Finales" en Google Drive
 */
export const DRIVE_EXAMENES_IDS: Record<number, string> = {
  // 1ER NIVEL
  1: '1mr3j_Qxmf_MmKzam9x9kXgyVyN03uW9O', // Análisis Matemático I (Examenes)
  2: '1Vx5xAX2n5eF9E3JqSr-KAtGARL8bUizn', // Álgebra y Geometría Analítica (Examenes)
  3: '1gZhk1BgcGu0Jy4V_7-Oxcw1suwR_5-_b', // Física I (Examenes)
  4: '1c0RruuGXihNmAc8DIOcCuHuigjVAsJbp', // Inglés I (Examenes)
  5: '1pYolIfXBmXGTdG0bIYFfIoDErj9gUOQ_', // Lógica y Estructuras Discretas (Examenes)
  6: '135Eu6Mn8mQp457iIVirEAFX3Ibs2CaCc', // Algoritmos y Estructuras de Datos (Examenes)
  7: '1064a_-2co7fryFUzjEp3IR_umWNzRvZH', // Arquitectura de Computadoras (Examenes)
  8: '1wKnEnkiaqVD4IY-DTyzIM2RayJistLbB', // Sistemas y Procesos de Negocio (Examenes)

  // 2DO NIVEL
  9: '1bb5r7mOYzSSpDH4qhR64VNUmeqMmjkI2',  // Análisis Matemático II (Examenes)
  10: '10qOQLsKILZ_PrXG4F7HhfgCb7hS_9f7Y', // Física II (Examenes)
  11: '1qWgQpmBR2a6h0tmMnigl4TkTdBQWFlNU', // Ingeniería y Sociedad (Examenes)
  12: '1f5DXlncczQxkqLNwxkiJHKnXOJU_hV4b', // Inglés II (Examenes)
  13: '1arpy9_8REA3znc4_oNDw6Pr-DA-1z445', // Sintaxis y Semántica de los Lenguajes (Examenes)
  14: '1JSHbRXliqeKWhxX7KHCf0SonJBEjLCuw', // Paradigmas de Programación (Examenes)
  15: '1HGxPMhJOl_Xi0zIuWBuJsrBDDRdteqhi', // Sistemas Operativos (Examenes)
  16: '16Cv3_TwmWSiy-GdfYqNesmSL4jr9pDOx', // Análisis de Sistemas de Información (Examenes)

  // 3ER NIVEL
  17: '1VuPMH5XqIEYngUx2v4vpZrt8y4k9Rasp', // Probabilidad y Estadística (Examenes)
  18: '17XzRUopkq3bE83ATYuA4sLumUFU8GYkp', // Economía (Examenes)
  19: '1Bs-D5DlF1beNPyTZgXJNyD86MQmtTvOT', // Base de Datos (Examenes)
  20: '19sDjzKrhh2Er5-UVvfmt5-YVmDBjB4gQ', // Desarrollo de Software (Parcial)
  21: '1gewJzLHwcZ7qhCYlnHtyaFshJyVv_1k2', // Comunicación de Datos (Examenes)
  22: '1T921bg7Lr8yGl4NbrLVTBFPBGW8ZxwtY', // Análisis Numérico (Examenes)
  23: '19GFm95pN_SZpY5HHtLWDJJjGqP5ybLdi', // Diseño de Sistemas de Información (Examenes)

  // 4TO NIVEL
  24: '1iaqDVnlXrtvlb8Z3TlEHYc4YAZ7eZYyw', // Legislación (Examenes)
  25: '1bmefA2gC-KYsQKt1ziig1CJYB4IuR85A', // Ingeniería y Calidad de Software (Examenes)
  26: '1kDOSai8nFesV3J3n5Ruw47FwElR45dPP', // Redes de Datos (Examenes)
  27: '18mQwumN0tt-xHJXc3CNilKbi9MrGSwZ2', // Investigación Operativa (Examenes)
  28: '1NUaEeoyvfnRXFTbiUYCqsXRu6j6UOMyB', // Simulación (Examenes)
  29: '1frTe447IMVxXXpbQtFhXXo299lt9c4V1', // Tecnologías para la Automatización (Examenes)
  30: '1U87S5FxIadf9rHUcUQl7KGcpoyLeR7bW', // Administración de Sistemas de Información (Examenes)

  // 5TO NIVEL
  31: '174NKJbaPhZx_2FtcRUN5stxolNHtIk1H', // Inteligencia Artificial (Exámenes)
  32: '1Pm0mUVy4pLeUhpLl8HdxoJE7s8ufBghp', // Ciencia de Datos (Examenes)
  33: '1gY3CeDugsvKdAbx_RcArnGcOR6Tkw__P', // Sistemas de Gestión (Examenes)
  34: '1vMWLEi3lv_bxjhEQMOGRVBrIHpJYwa02', // Gestión Gerencial (Examenes)
  35: '1NXNkWNO6Nyvyh1R9yr9eFMXst58h4TSq', // Seguridad en los Sistemas de Información (Parciales)

  // ELECTIVAS
  201: '1byRJ0GY7SZ7zmtxqY5YiIbn9mcPyqewT', // Entornos Gráficos (Examenes)
  203: '1l_NjJRqEH3OZ79j32DIO35kezuEWhz0R', // Sistemas de Información Geográfica (Parciales)
  205: '1w0BxNMMUVO7M09tJgKziuKB_UtHKbb2X', // Algoritmos Genéticos (Finales)
  207: '1qQgSJG6Wiu6vwAKJWyB_XBh71rLCFCou', // Lenguaje JAVA (Sistema para final)
  208: '1rBAVxppoXfY5IhP3xYGmtNkm53DigGNm', // IDE .NET (Parciales)
  209: '1NGoTz-5Ip_f1vieGc97t4X01FNvozBBF', // Gestión Ingenieril (Examenes)
  210: '14syeceuyZtSLgBI7Fl0kf_N5c5SBtYXj', // Intro Práctica Prof (Parciales)
  211: '19gj4_30M6KgdNnuwUcENt6R5P2b-tsPV', // Química Aplicada (Examenes)
  212: '1P_VbmGOxdpONQK16ya9Y3js4vdXRcIoZ', // Infraestructura Tecnológica (Parciales)
  213: '1m7wc9EHPlOQbhMbmOdksb3i_QvoFUY8M', // Soporte a la Gestión de Datos (Parciales)
  217: '15VsXYQFmxKGDS_Pj6hBfTuh7xlmoYoeD', // Dirección de RRHH (Parciales)
};

/**
 * Retorna la URL de Google Drive correspondiente a un nivel/año.
 */
export function getDriveUrlForNivel(nivel: number): string {
  const folderId = DRIVE_NIVELES_IDS[nivel];
  return folderId ? `https://drive.google.com/drive/folders/${folderId}` : DRIVE_ROOT_URL;
}

/**
 * Retorna la URL de Google Drive para una materia específica.
 * Si la materia tiene una carpeta propia, la abre; si no, abre la de su nivel o la raíz.
 */
export function getDriveUrlForMateria(materiaId: number, nivel?: number): string {
  const folderId = DRIVE_MATERIAS_IDS[materiaId];
  if (folderId) {
    return `https://drive.google.com/drive/folders/${folderId}`;
  }
  // Si es una materia electiva (IDs >= 200 && < 300) sin carpeta propia, redirigir a la carpeta raíz de Electivas
  if (materiaId >= 200 && materiaId < 300) {
    return DRIVE_ELECTIVAS_ROOT_URL;
  }
  if (nivel && DRIVE_NIVELES_IDS[nivel]) {
    return `https://drive.google.com/drive/folders/${DRIVE_NIVELES_IDS[nivel]}`;
  }
  return DRIVE_ROOT_URL;
}

/**
 * Retorna la URL de Google Drive correspondiente a la subcarpeta de exámenes de una materia.
 * Si la materia tiene una subcarpeta de exámenes identificada, abre dicha carpeta;
 * de lo contrario, hace fallback a la carpeta general de la materia o de su nivel.
 */
export function getDriveUrlForExamenes(materiaId: number, nivel?: number): string {
  const examFolderId = DRIVE_EXAMENES_IDS[materiaId];
  if (examFolderId) {
    return `https://drive.google.com/drive/folders/${examFolderId}`;
  }
  return getDriveUrlForMateria(materiaId, nivel);
}

/**
 * Indica si una materia tiene una subcarpeta específica de exámenes en Google Drive.
 */
export function hasSpecificDriveExamenesFolder(materiaId: number): boolean {
  return Boolean(DRIVE_EXAMENES_IDS[materiaId]);
}

/**
 * Indica si una materia tiene una carpeta específica en Google Drive.
 */
export function hasSpecificDriveFolder(materiaId: number): boolean {
  return Boolean(DRIVE_MATERIAS_IDS[materiaId]);
}

