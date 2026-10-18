# GEMINI.md · Guía de Contexto y Arquitectura del Proyecto

Este documento proporciona las directrices, convenciones y mapa arquitectónico para asistentes de Inteligencia Artificial (Gemini, Claude, Antigravity, Cursor) y desarrolladores que trabajen en este repositorio.

---

## 📌 Contexto del Proyecto

- **Nombre:** Tracker UTN Sistemas (Plan 2023 · FRRo)
- **Propósito:** Seguimiento interactivo del avance académico, correlatividades en tiempo real (cursado y finales), planificación de mesas de exámenes, cálculo de promedios y requerimientos de títulos para **Ingeniería en Sistemas de Información (UTN Facultad Regional Rosario)**.
- **Producción:** Desplegado en Firebase Hosting: [https://utn-sistemas-frro.web.app](https://utn-sistemas-frro.web.app) (Alternativo: [https://tracker-isi-frro.web.app](https://tracker-isi-frro.web.app))
- **Arquitectura:** Monorepo gestionado con `pnpm workspaces`.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 19, TypeScript (~6.0), Vite (v8 + Rolldown), Tailwind CSS (v4) |
| **Visualización** | `vis-network` y `vis-data` (cargado diferido vía `React.lazy`) |
| **Iconos & Accesibilidad** | `lucide-react`, Custom Focus Trap (`useFocusTrap.ts`), WCAG 2.2 AA |
| **Linter** | `oxlint` (Oxc compiler stack, 0 warnings policy) |
| **Backend (Opcional)** | Node.js, Express, TypeScript, JWT, Bcrypt |
| **Emails Transaccionales** | Resend SDK (Emails de bienvenida y recordatorios de exámenes a 7 días) |
| **Nube & Hosting** | Firebase Hosting, Firebase Auth, Cloud Firestore |

---

## 📂 Mapa de la Estructura de Archivos

```
tracker-ing-sist/
├── .firebaserc                     # ID del proyecto Firebase (tracker-isi-utn-6f213)
├── .oxlintrc.json                  # Configuración de linter oxlint unificada
├── firebase.json                   # Reglas de hosting, rewrites SPA y headers de caché
├── firestore.indexes.json          # Índices de Cloud Firestore
├── firestore.rules                 # Reglas de seguridad de Firestore
├── package.json                    # Scripts del monorepo (dev, build, lint, deploy)
├── pnpm-workspace.yaml             # Definición de paquetes (backend y frontend)
├── GEMINI.md                       # Este documento de contexto
├── README.md                       # Documentación principal en español
│
├── docs/                           # Documentación técnica (Diátaxis) y cartillas oficiales
│   ├── README.md                   # Índice maestro de documentación
│   ├── tutorials/                  # Tutoriales prácticos (primeros pasos)
│   ├── how-to/                     # Guías prácticas (materias, calendario, tests, deploy)
│   ├── reference/                  # Referencia técnica (tipos, API REST, contextos)
│   ├── explanation/                # Explicaciones de diseño (cascada, merge offline-first, WCAG)
│   ├── isi-a4-plan-2023-gradiente-utn-frro.pdf # Cartilla oficial del Plan 2023
│   ├── electivas-plan-2023.png     # Grilla oficial de electivas
│   └── calendario-2026-2027-gradiente.pdf # Calendario de turnos de examen
│
├── backend/                        # API REST en Express (opcional/híbrido)
│   ├── src/
│   │   ├── auth/                   # Autenticación JWT y middlewares
│   │   ├── data/                   # Catálogo de materias
│   │   ├── routes/                 # Endpoints /api/plan, /api/progress, /api/auth, /api/mail/*
│   │   ├── services/               # emailService.ts (Resend) y reminderService.ts (alertas 7 días)
│   │   ├── scripts/                # testEmail.ts (prueba directa de correos con Resend)
│   │   └── server.ts
│   └── package.json
│
└── frontend/                       # Aplicación cliente React 19 SPA
    ├── src/
    │   ├── components/             # Componentes modulares por dominio
    │   │   ├── layout/             # Header, BottomNav, ThemeSelector, Toast, ErrorBoundary
    │   │   ├── views/              # GridView (Malla), NetworkGraph, ElectivasDrawer, MobileElectivasView
    │   │   ├── modals/             # SubjectModal, CalendarModal, ProfileModal, StatsModal, etc.
    │   │   ├── ui/                 # Primitivas accesibles (Modal, StatusBadge)
    │   │   └── index.ts            # Barrel export unificado
    │   ├── context/                # TrackerContext (académico), ThemeContext (temas), AuthContext (sesión)
    │   ├── data/                   # plan2023.ts (materias troncales/electivas), calendario/ (módulo anual)
    │   ├── hooks/                  # useFocusTrap.ts, useKeyboardShortcuts.ts
    │   ├── services/               # api.ts (backend/localStorage), firebase.ts (Cloud Firestore)
    │   ├── types/                  # plan.ts (EstadoMateria, ProgresoUsuario, etc.)
    │   ├── utils/                  # icsExporter.ts (.ics calendar), share.ts (links comprimidos)
    │   ├── App.tsx                 # Contenedor principal con BottomNav y atajos
    │   └── index.css               # Estilos globales y temas CSS
    ├── package.json
    └── vite.config.ts
```

---

## 📐 Convenciones y Reglas de Desarrollo

### 1. Tailwind CSS v4 (Sintaxis Canónica)
- **Nunca** utilizar variables CSS en corchetes arbitrarios:
  - ❌ `bg-[var(--bg-surface)]`
  - ❌ `text-[var(--text-body)]`
- **Siempre** utilizar la sintaxis oficial de Tailwind v4:
  - ✅ `bg-(--bg-surface)`
  - ✅ `text-(--text-body)`
  - ✅ `border-(--border-color)`
- Utilizar clases de escala estándar siempre que coincidan: `min-w-9` (36px), `min-w-10` (40px), `h-dvh` (Dynamic Viewport Height).

### 2. React 19 y Rendimiento
- **Code-Splitting del Grafo:** `NetworkGraph.tsx` debe importarse siempre de forma perezosa (`React.lazy`) en `App.tsx` para evitar cargar la librería de red (`vis-network`, ~760 kB) en el bundle inicial. No debe exportarse estáticamente en `views/index.ts`.
- **Side-effects en Efectos:** Evitar `setState` sincrónico dentro de un `useEffect` (regla `react(set-state-in-effect)`). Sincronizar el estado durante el renderizado comparando con el valor previo (`prevProp !== currentProp`).
- **Hooks y Callbacks:** Todo callback pasado a listeners de ventana o efectos debe estar memoizado con `useCallback` o gestionado con refs estables.

### 3. Linter y Tipado
- Mantener siempre **0 warnings y 0 errores** al correr `pnpm run lint` (`oxlint`).
- La configuración de Oxlint se encuentra en `.oxlintrc.json` con excepción en `overrides` para contextos (`src/context/**/*.tsx`) permitiendo exportar Providers y Custom Hooks en el mismo archivo.

### 4. Git y Commits
- Formato **Conventional Commits**:
  - `feat:` Nuevas funcionalidades.
  - `fix:` Correcciones de bugs o inconsistencias.
  - `style:` Ajustes visuales, clases de CSS o formateo.
  - `refactor:` Reestructuración sin cambio funcional.
  - `chore:` Tareas de mantenimiento, scripts o configuración.

---

## ⚡ Comandos Esenciales

```bash
# Desarrollo
pnpm dev              # Levanta backend y frontend concurrentemente
pnpm dev:frontend     # Solo cliente Vite (puerto 5173)

# Calidad, Pruebas y Compilación
pnpm lint             # Oxlint sobre packages/types, frontend y backend (0 warnings, 0 errores en 106 archivos)
pnpm test             # Ejecuta los 262 tests unitarios y de integración (62 backend y 200 frontend)
pnpm test:coverage    # Reporte de cobertura V8 consolidada (99.05% backend, 87.3% frontend)
pnpm test:e2e         # Pruebas End-to-End con Playwright (23 escenarios: 18 Desktop y 5 Mobile, 100% aprobados)
pnpm build            # Compila TypeScript en types/backend y Vite en frontend
pnpm --filter tracker-backend test:email # Prueba de envío de correos con Resend a la casilla de revisión

# Despliegue y CI/CD
pnpm deploy           # Compila y despliega en Firebase Hosting
# CI/CD automatizado: GitHub Actions (.github/workflows/ci-cd.yml) ejecuta lint, vitest, playwright, build y deploy automático a producción en main
```
