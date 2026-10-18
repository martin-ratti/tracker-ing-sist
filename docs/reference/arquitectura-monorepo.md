# Referencia: Monorepo, Herramientas y Scripts 🛠️

Esta referencia técnica documenta la arquitectura del monorepo, las herramientas de compilación, linters y scripts automatizados de Tracker ISI.

---

## 🏗️ Estructura del Monorepo

El proyecto está configurado como un monorepo administrado con **pnpm workspaces** ([pnpm-workspace.yaml](../../pnpm-workspace.yaml)):

```yaml
packages:
  - 'backend'
  - 'frontend'
  - 'packages/*'
allowBuilds:
  '@firebase/util': true
  esbuild: true
  protobufjs: true
```

### Paquetes del Workspace:
1. **`@tracker/types` (`packages/types/`):** Contratos de datos TypeScript compartidos (tipos canónicos para materias, electivas, estados y progreso).
2. **`tracker-backend` (`backend/`):** API REST en Node.js, Express y TypeScript.
3. **`frontend` (`frontend/`):** SPA en React 19, TypeScript, Vite 8 y Tailwind CSS v4.

---

## 📜 Scripts de `package.json`

| Script | Comando | Descripción |
|---|---|---|
| `pnpm dev` | `concurrently "pnpm --filter tracker-backend dev" "pnpm --filter frontend dev"` | Levanta backend (puerto 3001) y frontend (puerto 5173) en paralelo con prefijos de colores. |
| `pnpm dev:backend` | `pnpm --filter tracker-backend dev` | Inicia únicamente el backend con `tsx watch src/server.ts`. |
| `pnpm dev:frontend` | `pnpm --filter frontend dev` | Inicia únicamente el frontend con `vite`. |
| `pnpm build` | `pnpm --filter @tracker/types build && pnpm --filter tracker-backend build && pnpm --filter frontend build` | Compila tipos (`tsc`), backend (`tsc`) y genera el bundle frontend optimizado (`tsc -b && vite build`). |
| `pnpm lint` | `oxlint packages/types/src frontend/src backend/src` | Linter ultrarrápido con Oxc. Aplica la política de 0 advertencias y 0 errores en 97 archivos. |
| `pnpm test` | `pnpm --filter tracker-backend test && pnpm --filter frontend test` | Ejecuta las 241 pruebas unitarias e integración en ambos paquetes con Vitest. |
| `pnpm test:coverage` | `pnpm --filter tracker-backend test:coverage && pnpm --filter frontend test:coverage` | Genera reportes de cobertura V8 para backend y frontend. |
| `pnpm test:e2e` | `playwright test` | Ejecuta la suite de 23 pruebas End-to-End con Playwright (Chromium Desktop y Mobile Chrome). |
| `pnpm deploy` | `pnpm build && firebase deploy --only hosting` | Compila los paquetes y publica en Firebase Hosting. |
| `pnpm deploy:all` | `pnpm build && firebase deploy` | Compila y despliega Hosting, reglas e índices de Cloud Firestore. |

---

## 🎨 Convenciones de Tailwind CSS v4

El proyecto utiliza **Tailwind CSS v4** mediante el plugin oficial `@tailwindcss/vite`. En esta versión, la sintaxis canónica para variables CSS es:

- ✅ **Correcto (Sintaxis v4):**
  - `bg-(--bg-surface)`
  - `text-(--text-title)`
  - `border-(--border-color)`
- ❌ **Incorrecto (Sintaxis v3 deprecada):**
  - `bg-[var(--bg-surface)]`
  - `text-[var(--text-title)]`

### Variables Semánticas del Tema ([frontend/src/index.css](../../frontend/src/index.css)):
- `--bg-base`: Fondo general de la aplicación.
- `--bg-surface`: Fondo de tarjetas, paneles y contenedores.
- `--border-color`: Color de bordes y separadores.
- `--text-title`: Tipografía destacada y títulos.
- `--text-body`: Texto estándar de párrafos y etiquetas.
- `--status-cursable`: Acento para materias cursables habilitadas.
- `--status-regular`: Amarillo para materias regularizadas.
- `--status-approved`: Verde para materias aprobadas.

---

## 🔍 Configuración de Oxlint ([.oxlintrc.json](../../.oxlintrc.json))

Oxlint proporciona análisis estático en milisegundos.
- **Plugins activados:** `react`, `typescript`, `oxc`.
- **Reglas clave:**
  - `react/rules-of-hooks`: Previene violaciones de las reglas de Hooks de React.
  - `react/only-export-components`: Advertencia de componentes limpios para fast-refresh, con excepción en `src/context/**/*.tsx` para permitir exportar Providers y Custom Hooks en un mismo archivo.

