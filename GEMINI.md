# GEMINI.md · Guía de Contexto y Arquitectura del Proyecto

Este documento proporciona las directrices, convenciones y mapa arquitectónico para asistentes de Inteligencia Artificial (Gemini, Claude, Antigravity, Cursor) y desarrolladores que trabajen en este repositorio.

---

## 📌 Contexto del Proyecto

- **Nombre:** Tracker UTN Sistemas (Plan 2023 · FRRo)
- **Propósito:** Seguimiento interactivo del avance académico, correlatividades en tiempo real (cursado y finales), planificación de mesas de exámenes, cálculo de promedios y requerimientos de títulos para **Ingeniería en Sistemas de Información (UTN Facultad Regional Rosario)**.
- **Producción:** Desplegado en Firebase Hosting: [https://tracker-isi-utn-6f213.web.app](https://tracker-isi-utn-6f213.web.app)
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
├── docs/                           # Documentos oficiales digitalizados de UTN FRRo
│   ├── isi-a4-plan-2023-gradiente-utn-frro.pdf # Cartilla oficial del Plan 2023
│   ├── electivas-plan-2023.png     # Grilla oficial de electivas
│   └── calendario-2026-2027-gradiente.pdf # Calendario de turnos de examen
│
├── backend/                        # API REST en Express (opcional/híbrido)
│   ├── src/
│   │   ├── auth/                   # Autenticación JWT y middlewares
│   │   ├── data/                   # Catálogo de materias
│   │   ├── routes/                 # Endpoints /api/plan, /api/progress, /api/auth
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
    │   ├── data/                   # plan2023.ts (materias troncales/electivas), calendario2026.ts (turnos)
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

# Calidad y Compilación
pnpm lint             # Oxlint sobre frontend y backend (0 warnings)
pnpm build            # Compila TypeScript en backend y Vite en frontend

# Despliegue
npm run deploy        # Compila y despliega en Firebase Hosting
```
