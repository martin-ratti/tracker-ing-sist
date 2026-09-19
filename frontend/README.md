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
│   │   ├── ThemeSelector.tsx   # Menú selector de los 5 temas visuales
│   │   ├── Toast.tsx           # Notificaciones contextuales flotantes
│   │   ├── ErrorBoundary.tsx   # Captura de errores en runtime
│   │   └── index.ts
│   ├── views/                  # Vistas principales de la carrera
│   │   ├── GridView.tsx        # Malla curricular interactiva por niveles (1º a 5º año)
│   │   ├── NetworkGraph.tsx    # Grafo de correlatividades (lazy loaded, vis-network)
│   │   ├── GraphSkeleton.tsx   # Esqueleto animado de carga para el grafo
│   │   ├── ElectivasDrawer.tsx # Panel lateral de materias electivas y Seminario ADUSI
│   │   ├── MobileElectivasView.tsx # Vista dedicada de electivas optimizada para móvil
│   │   └── index.ts
│   ├── modals/                 # Todos los diálogos modales de la aplicación
│   │   ├── SubjectModal.tsx    # Detalle de materia, correlatividades, notas y meta
│   │   ├── CalendarModal.tsx   # Calendario oficial de finales 2026-2027 y fechas
│   │   ├── PrintableReportModal.tsx # Analítico imprimible oficial (A4 / PDF)
│   │   ├── ProfileModal.tsx    # Edición de Nombre y Legajo del estudiante
│   │   ├── StatsModal.tsx      # Estadísticas avanzadas y gráficas de rendimiento
│   │   ├── TitlesModal.tsx     # Medidor de avance para ADUSI e Ingeniería + PPS
│   │   ├── AuthModal.tsx       # Inicio de sesión y registro con fusión inteligente
│   │   ├── HelpModal.tsx       # Guía interactiva de usuario y simbología
│   │   ├── ShareModal.tsx      # Generación de enlaces para compartir avance
│   │   └── index.ts
│   ├── ui/                     # Primitivas accesibles y reutilizables
│   │   ├── Modal.tsx           # Contenedor modal con FocusTrap y soporte móvil
│   │   ├── StatusBadge.tsx     # Badges de estado de materias
│   │   └── index.ts
│   └── index.ts                # Barrel export centralizado de componentes
├── context/                    # Context API de React
│   ├── TrackerContext.tsx      # Estado global académico, correlatividades y notas
│   ├── ThemeContext.tsx        # Gestión reactiva de los 5 temas cromáticos
│   └── AuthContext.tsx         # Gestión de sesión, autenticación y persistencia
├── data/                       # Datos estáticos oficiales de la facultad
│   ├── plan2023.ts             # 36 materias troncales + electivas oficiales Plan 2023
│   └── calendario2026.ts       # 16 turnos de examen oficiales UTN FRRo 2026-2027
├── hooks/                      # Custom hooks
│   ├── useFocusTrap.ts         # Atrapado accesible de foco para modales (WCAG)
│   └── useKeyboardShortcuts.ts # Atajos rápidos de teclado (G, M, E, C, P, etc.)
├── services/                   # Clientes de API y sincronización
│   ├── api.ts                  # Comunicación con backend REST y localStorage
│   └── firebase.ts             # Conexión con Firebase / Firestore
├── types/                      # Tipos de TypeScript compartidos
│   └── plan.ts
├── utils/                      # Utilidades y funciones auxiliares
│   ├── icsExporter.ts          # Exportador de metas de examen a formato iCalendar (.ics)
│   └── share.ts                # Serialización y compresión de progreso para URLs
├── App.tsx                     # Componente raíz y orquestador de vistas
└── index.css                   # Tailwind CSS v4, temas CSS semánticos y reglas print
```

---

## 🎨 Sistema de Estilos: Tailwind CSS v4

El proyecto utiliza **Tailwind CSS v4** integrado directamente con Vite mediante `@tailwindcss/vite`:
- **Variables Semánticas:** Uso de la sintaxis canónica `bg-(--bg-surface)`, `text-(--text-body)`, etc.
- **Temas Dinámicos:** 5 paletas cromáticas (`Cyber Blueprint`, `Neon Synthwave`, `Emerald Matrix`, `Amber Sunset`, `Nordic Frost`) definidas mediante variables CSS nativas en `index.css`.
- **Modo Impresión:** Estilos optimizados bajo `@media print` para exportar el reporte analítico en una página A4 limpia sin barras de navegación ni fondos de color.

---

## 🛠️ Scripts Disponibles

Desde el directorio `frontend/`:

```bash
# Iniciar servidor de desarrollo en http://localhost:5173
pnpm dev

# Compilar tipos TypeScript y generar bundle de producción con Vite
pnpm build

# Ejecutar el linter Oxlint
pnpm lint

# Previsualizar el bundle de producción localmente
pnpm preview
```
