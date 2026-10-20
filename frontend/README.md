# Tracker ISI UTN · Frontend (React 19 + TypeScript + Vite) 💻

Cliente web interactivo para la gestión de materias, correlativas, cálculo de títulos y planificación de exámenes de **Ingeniería en Sistemas de Información (UTN FRRo - Plan 2023)**.

---

## 🏗️ Arquitectura de Directorios

El código fuente en `src/` sigue una estructura modular y orientada a dominios:

```
src/
├── components/                 # Componentes de React modulares
│   ├── layout/                 # Estructura general, barras y navegación
│   │   ├── Header.tsx          # Barra superior con estadísticas, metas y perfil
│   │   ├── BottomNav.tsx       # Barra de navegación fija ergonómica para celulares
│   │   ├── MobileDrawer.tsx    # Menú lateral expandible para pantallas móviles
│   │   ├── ThemeSelector.tsx   # Menú selector de los 5 temas visuales
│   │   ├── Toast.tsx           # Notificaciones contextuales flotantes
│   │   ├── ErrorBoundary.tsx   # Captura de errores en runtime con fallback accesible
│   │   └── index.ts
│   ├── views/                  # Vistas principales de la carrera
│   │   ├── GridView.tsx        # Malla curricular interactiva por niveles (1º a 5º año) con filtros
│   │   ├── NetworkGraph.tsx    # Grafo de correlatividades (lazy loaded, vis-network)
│   │   ├── GraphSkeleton.tsx   # Esqueleto animado de carga para el grafo
│   │   ├── ElectivasDrawer.tsx # Panel lateral de materias electivas y Seminario ADUSI
│   │   ├── MobileElectivasView.tsx # Vista dedicada de electivas optimizada para móvil
│   │   ├── NotFoundView.tsx    # Pantalla 404 ante rutas inválidas con recuperación
│   │   ├── graph/              # Submódulos del grafo interactivo
│   │   │   ├── GraphNodeInspector.tsx # Ficha flotante de inspección de correlativas
│   │   │   ├── GraphSearchBar.tsx     # Buscador predictivo en grafo
│   │   │   ├── graphDependencies.ts   # Árbol de ancestros y descendientes
│   │   │   ├── graphPositions.ts      # Coordenadas jerárquicas de nodos
│   │   │   └── graphStyles.ts         # Estilos visuales sincronizados con temas
│   │   └── index.ts
│   ├── modals/                 # Todos los diálogos modales de la aplicación
│   │   ├── SubjectModal.tsx    # Detalle de materia, correlatividades, notas, actas y metas
│   │   ├── CalendarModal.tsx   # Calendario oficial de finales 2026-2027 y fechas
│   │   ├── PrintableReportModal.tsx # Analítico oficial y ficha curricular (A4 / PDF)
│   │   ├── ProfileModal.tsx    # Edición de alumno, respaldo .json y donaciones
│   │   ├── StatsModal.tsx      # Estadísticas avanzadas y rendimiento académico
│   │   ├── TitlesModal.tsx     # Medidor de avance para ADUSI e Ingeniería + horas PPS
│   │   ├── AuthModal.tsx       # Inicio de sesión híbrido (Firebase / Backend / Local)
│   │   ├── HelpModal.tsx       # Guía interactiva de usuario y atajos de teclado
│   │   ├── ShareModal.tsx      # Generación de enlaces comprimidos para compartir avance
│   │   ├── calendar/           # Submódulos del calendario académico
│   │   │   ├── CalendarMetasTab.tsx      # Metas de examen con cuenta regresiva
│   │   │   ├── CalendarTurnosTab.tsx     # 16 turnos oficiales y directivas Sysacad
│   │   │   ├── CalendarMonthGrid.tsx     # Navegación mes a mes con feriados
│   │   │   └── CalendarScheduleDialog.tsx# Agendamiento interactivo de examen
│   │   └── index.ts
│   ├── ui/                     # Primitivas accesibles y reutilizables
│   │   ├── Modal.tsx           # Contenedor modal con FocusTrap y soporte móvil
│   │   ├── StatusBadge.tsx     # Badges de estado de materias
│   │   └── index.ts
│   └── index.ts                # Barrel export centralizado de componentes
├── context/                    # Context API de React
│   ├── TrackerContext.tsx      # Estado global académico, correlatividades y notas
│   ├── ThemeContext.tsx        # Gestión reactiva de los 5 temas cromáticos
│   ├── AuthContext.tsx         # Gestión de sesión, autenticación y persistencia
│   └── UIContext.tsx           # Estado visual secundario y control de modales
├── data/                       # Datos estáticos oficiales de la facultad
│   ├── plan2023.ts             # 36 materias troncales + 19 electivas oficiales Plan 2023
│   ├── donations.ts            # Configuración de donaciones por Mercado Pago
│   ├── driveLinks.ts           # Enlaces directos comunitarios a Google Drive
│   └── calendario/             # Sistema modular anual (turnos oficiales, feriados fijos/móviles e hitos)
├── hooks/                      # Custom hooks
│   ├── useFocusTrap.ts         # Atrapado accesible de foco para modales (WCAG)
│   ├── useKeyboardShortcuts.ts # Atajos rápidos de teclado (G, M, E, C, R, P, etc.)
│   ├── useHistoryBack.ts       # Sincronización con botón atrás en móviles
│   └── useModalAnimation.ts    # Control de animación de entrada/salida en diálogos
├── services/                   # Clientes de API, persistencia y seguridad
│   ├── api.ts                  # Backend REST, localStorage seguro y sanitización anti-poisoning
│   └── firebase.ts             # Conexión con Firebase / Cloud Firestore
├── types/                      # Re-export de tipos canónicos de @tracker/types
│   └── plan.ts
├── utils/                      # Utilidades y funciones auxiliares
│   ├── pdfExporter.ts          # Generador nativo multi-página vectorial en PDF (jsPDF + Autotable)
│   ├── backupManager.ts        # Exportación e importación de respaldos en JSON (.json)
│   ├── academicCalculations.ts # Cálculo de métricas, títulos, promedios y porcentajes
│   ├── cascadeEngine.ts        # Motor de invalidación en cascada de correlativas
│   ├── correlativesEngine.ts   # Motor de evaluación de requisitos para cursar y rendir
│   ├── icsExporter.ts          # Exportador de metas de examen a formato iCalendar (.ics)
│   ├── share.ts                # Serialización y compresión de progreso para URLs
│   └── formatters.ts           # Formateadores de fecha, promedios y notas
├── App.tsx                     # Componente raíz y orquestador de vistas
└── index.css                   # Tailwind CSS v4, temas CSS semánticos y reglas print
```

---

## 🎨 Sistema de Estilos & Exportación a PDF

- **Tailwind CSS v4:** Integrado directamente con Vite mediante `@tailwindcss/vite` utilizando sintaxis canónica (`bg-(--bg-surface)`, `text-(--text-body)`).
- **Temas Dinámicos:** 5 paletas cromáticas (`Cyber Blueprint`, `Neon Synthwave`, `Emerald Matrix`, `Amber Sunset`, `Nordic Frost`) definidas mediante variables CSS nativas en `index.css`.
- **Ficha y Analítico PDF Nativo:** Generación vectorial de alta definición con `jsPDF` y `jspdf-autotable` (`pdfExporter.ts`), con descarga directa de archivo `Ficha_Curricular_UTN_ISI_[legajo].pdf`, membrete institucional, datos del alumno, 4 tarjetas de métricas, tablas por nivel académico, electivas acreditadas, metas de final y pie de página foliado.
- **Modo Impresión:** Estilos optimizados bajo `@media print` para exportar el reporte analítico en una página A4 limpia sin barras de navegación ni fondos de color.

---

## 🛠️ Scripts Disponibles

Desde el directorio `frontend/`:

```bash
# Iniciar servidor de desarrollo en http://localhost:5173
pnpm dev

# Compilar tipos TypeScript y generar bundle de producción con Vite
pnpm build

# Ejecutar pruebas unitarias y de integración (216 tests en 28 suites)
pnpm test

# Ejecutar pruebas en modo watch reactivo
pnpm test:watch

# Ejecutar el linter Oxlint
pnpm lint

# Previsualizar el bundle de producción localmente
pnpm preview
```
