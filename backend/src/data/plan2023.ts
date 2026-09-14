import { Materia, Electiva } from '../types/plan.js';

export const MATERIAS_TRONCALES: Materia[] = [
  // 1ER NIVEL
  { id: 1, nombre: "AM I", nombreCompleto: "Análisis Matemático I", nivel: 1, horas: 5, reqRegular: [], reqAprobada: [] },
  { id: 2, nombre: "Álgebra", nombreCompleto: "Álgebra y Geometría Analítica", nivel: 1, horas: 5, reqRegular: [], reqAprobada: [] },
  { id: 3, nombre: "Física I", nombreCompleto: "Física I", nivel: 1, horas: 5, reqRegular: [], reqAprobada: [] },
  { id: 4, nombre: "Inglés I", nombreCompleto: "Inglés I", nivel: 1, horas: 2, reqRegular: [], reqAprobada: [] },
  { id: 5, nombre: "Lógica", nombreCompleto: "Lógica y Estructuras Discretas", nivel: 1, horas: 3, reqRegular: [], reqAprobada: [] },
  { id: 6, nombre: "Algoritmos", nombreCompleto: "Algoritmos y Estructuras de Datos", nivel: 1, horas: 5, reqRegular: [], reqAprobada: [] },
  { id: 7, nombre: "Arquitectura", nombreCompleto: "Arquitectura de Computadoras", nivel: 1, horas: 4, reqRegular: [], reqAprobada: [] },
  { id: 8, nombre: "Sist. y Procesos", nombreCompleto: "Sistemas y Procesos de Negocio", nivel: 1, horas: 3, reqRegular: [], reqAprobada: [] },

  // 2DO NIVEL
  { id: 9, nombre: "AM II", nombreCompleto: "Análisis Matemático II", nivel: 2, horas: 5, reqRegular: [1, 2], reqAprobada: [] },
  { id: 10, nombre: "Física II", nombreCompleto: "Física II", nivel: 2, horas: 5, reqRegular: [1, 3], reqAprobada: [] },
  { id: 11, nombre: "Ing. y Sociedad", nombreCompleto: "Ingeniería y Sociedad", nivel: 2, horas: 2, reqRegular: [], reqAprobada: [] },
  { id: 12, nombre: "Inglés II", nombreCompleto: "Inglés II", nivel: 2, horas: 2, reqRegular: [4], reqAprobada: [] },
  { id: 13, nombre: "Sintaxis", nombreCompleto: "Sintaxis y Semántica de los Lenguajes", nivel: 2, horas: 4, esCuatrimestral: true, reqRegular: [5, 6], reqAprobada: [] },
  { id: 14, nombre: "Paradigmas", nombreCompleto: "Paradigmas de Programación", nivel: 2, horas: 4, esCuatrimestral: true, reqRegular: [5, 6], reqAprobada: [] },
  { id: 15, nombre: "S.O.", nombreCompleto: "Sistemas Operativos", nivel: 2, horas: 4, esCuatrimestral: true, reqRegular: [7], reqAprobada: [] },
  { id: 16, nombre: "ASI", nombreCompleto: "Análisis de Sistemas de Información", nivel: 2, horas: 6, esIntegradora: true, reqRegular: [6, 8], reqAprobada: [] },

  // 3ER NIVEL
  { id: 17, nombre: "Probabilidad", nombreCompleto: "Probabilidad y Estadística", nivel: 3, horas: 3, reqRegular: [1, 2], reqAprobada: [] },
  { id: 18, nombre: "Economía", nombreCompleto: "Economía", nivel: 3, horas: 3, reqRegular: [], reqAprobada: [1, 2] },
  { id: 19, nombre: "Base de Datos", nombreCompleto: "Base de Datos", nivel: 3, horas: 4, reqRegular: [13, 16], reqAprobada: [5, 6] },
  { id: 20, nombre: "Desarrollo", nombreCompleto: "Desarrollo de Software", nivel: 3, horas: 4, reqRegular: [14, 16], reqAprobada: [5, 6] },
  { id: 21, nombre: "Com. Datos", nombreCompleto: "Comunicación de Datos", nivel: 3, horas: 4, reqRegular: [], reqAprobada: [3, 7] },
  { id: 22, nombre: "Análisis Num.", nombreCompleto: "Análisis Numérico", nivel: 3, horas: 3, reqRegular: [9], reqAprobada: [1, 2] },
  { id: 23, nombre: "DSI", nombreCompleto: "Diseño de Sistemas de Información", nivel: 3, horas: 6, esIntegradora: true, reqRegular: [14, 16], reqAprobada: [4, 6, 8] },
  { id: 99, nombre: "Seminario ADUSI", nombreCompleto: "Seminario Integrador (ADUSI)", nivel: 3, horas: 4, esAdusiSolo: true, reqRegular: [16], reqAprobada: [6, 8, 13, 14] },

  // 4TO NIVEL
  { id: 24, nombre: "Legislación", nombreCompleto: "Legislación", nivel: 4, horas: 2, reqRegular: [11], reqAprobada: [] },
  { id: 25, nombre: "Ing. Calidad", nombreCompleto: "Ingeniería y Calidad de Software", nivel: 4, horas: 3, reqRegular: [19, 20, 23], reqAprobada: [13, 14] },
  { id: 26, nombre: "Redes", nombreCompleto: "Redes de Datos", nivel: 4, horas: 4, reqRegular: [15, 21], reqAprobada: [] },
  { id: 27, nombre: "Inv. Operativa", nombreCompleto: "Investigación Operativa", nivel: 4, horas: 4, reqRegular: [17, 22], reqAprobada: [] },
  { id: 28, nombre: "Simulación", nombreCompleto: "Simulación", nivel: 4, horas: 3, reqRegular: [17], reqAprobada: [9] },
  { id: 29, nombre: "Automatización", nombreCompleto: "Tecnologías para la Automatización", nivel: 4, horas: 3, reqRegular: [10, 22], reqAprobada: [9] },
  { id: 30, nombre: "Admin SI", nombreCompleto: "Administración de Sistemas de Información", nivel: 4, horas: 6, esIntegradora: true, reqRegular: [18, 23], reqAprobada: [16] },

  // 5TO NIVEL
  { id: 31, nombre: "IA", nombreCompleto: "Inteligencia Artificial", nivel: 5, horas: 3, reqRegular: [28], reqAprobada: [17, 22] },
  { id: 32, nombre: "Ciencia de Datos", nombreCompleto: "Ciencia de Datos", nivel: 5, horas: 3, reqRegular: [28], reqAprobada: [17, 19] },
  { id: 33, nombre: "Sist. Gestión", nombreCompleto: "Sistemas de Gestión", nivel: 5, horas: 4, reqRegular: [18, 27], reqAprobada: [23] },
  { id: 34, nombre: "Gestión Gerencial", nombreCompleto: "Gestión Gerencial", nivel: 5, horas: 3, reqRegular: [24, 30], reqAprobada: [18] },
  { id: 35, nombre: "Seguridad", nombreCompleto: "Seguridad en los Sistemas de Información", nivel: 5, horas: 3, reqRegular: [26, 30], reqAprobada: [20, 21] },
  {
    id: 36,
    nombre: "Proyecto Final",
    nombreCompleto: "Proyecto Final (INT)",
    nivel: 5,
    horas: 3,
    esIntegradora: true,
    reqRegular: [25, 26, 30],
    reqAprobada: [12, 20, 23],
    reqRendirAprobada: "TODAS"
  }
];

export const MATERIAS_ELECTIVAS: Electiva[] = [
  // Nivel 2
  { id: 201, nombre: "Entornos Gráficos", nivel: 2, horas: 4, tipo: "Cuatrimestral", cuatrimestre: "1°C / 2°C", reqRegular: [5], reqAprobada: [6, 8] },
  { id: 202, nombre: "Análisis y Diseño de Datos e Información", nivel: 2, horas: 3, tipo: "Cuatrimestral", cuatrimestre: "1°C / 2°C", reqRegular: [8, 13], reqAprobada: [6] },
  { id: 203, nombre: "Sistemas de Información Geográfica", nivel: 2, horas: 3, tipo: "Cuatrimestral", cuatrimestre: "1°C / 2°C", reqRegular: [1, 6], reqAprobada: [2] },
  { id: 204, nombre: "Programación Competitiva", nivel: 2, horas: 4, tipo: "Anual", cuatrimestre: "Anual", reqRegular: [6], reqAprobada: [2] },

  // Nivel 3
  { id: 205, nombre: "Algoritmos Genéticos", nivel: 3, horas: 4, tipo: "Anual", cuatrimestre: "Anual", reqRegular: [13, 14], reqAprobada: [5, 6, 7, 8] },
  { id: 206, nombre: "Informática Jurídica", nivel: 3, horas: 3, tipo: "Cuatrimestral", cuatrimestre: "1°C / 2°C", reqRegular: [15], reqAprobada: [6, 7, 8] },
  { id: 207, nombre: "Lenguaje de Programación JAVA", nivel: 3, horas: 4, tipo: "Anual", cuatrimestre: "Anual", reqRegular: [], reqAprobada: [14] },
  { id: 208, nombre: "Tecnologías de Desarrollo de Software IDE", nivel: 3, horas: 4, tipo: "Anual", cuatrimestre: "Anual", reqRegular: [], reqAprobada: [5, 13, 14] },
  { id: 209, nombre: "Gestión Ingenieril", nivel: 3, horas: 4, tipo: "Cuatrimestral", cuatrimestre: "1°C", reqRegular: [], reqAprobada: [8] },
  { id: 210, nombre: "Introducción a la Práctica Profesional", nivel: 3, horas: 4, tipo: "Anual", cuatrimestre: "Anual", reqRegular: [], reqAprobada: [16] },
  { id: 211, nombre: "Química Aplicada a la Informática", nivel: 3, horas: 3, tipo: "Cuatrimestral", cuatrimestre: "1°C", reqRegular: [4, 5, 6, 7, 8], reqAprobada: [1, 2, 3] },

  // Nivel 4
  { id: 212, nombre: "Infraestructura Tecnológica", nivel: 4, horas: 4, tipo: "Cuatrimestral", cuatrimestre: "2°C", reqRegular: [16], reqAprobada: [15] },
  { id: 213, nombre: "Soporte a la Gestión de Datos con Programación Visual", nivel: 4, horas: 4, tipo: "Anual", cuatrimestre: "Anual", reqRegular: [19], reqAprobada: [13, 14] },
  { id: 214, nombre: "Metodología de la Investigación", nivel: 4, horas: 4, tipo: "Cuatrimestral", cuatrimestre: "1°C", reqRegular: [17], reqAprobada: [17] },
  { id: 215, nombre: "Metodologías Ágiles en el Desarrollo de Software", nivel: 4, horas: 3, tipo: "Cuatrimestral", cuatrimestre: "1°C / 2°C", reqRegular: [25], reqAprobada: [14, 16] },

  // Nivel 5
  { id: 216, nombre: "Fabricación Aditiva", nivel: 5, horas: 3, tipo: "Anual", cuatrimestre: "Anual", reqRegular: [28, 29, 30], reqAprobada: [7, 15, 18] },
  { id: 217, nombre: "Dirección de Recursos Humanos", nivel: 5, horas: 3, tipo: "Cuatrimestral", cuatrimestre: "1°C / 2°C", reqRegular: [30], reqAprobada: [] },
  { id: 218, nombre: "Informática en la Administración Pública", nivel: 5, horas: 4, tipo: "Cuatrimestral", cuatrimestre: "2°C", reqRegular: [16], reqAprobada: [] },
  { id: 219, nombre: "Sistemas de Información Integrados para la Industria", nivel: 5, horas: 4, tipo: "Cuatrimestral", cuatrimestre: "2°C", reqRegular: [25, 27, 30], reqAprobada: [] }
];
