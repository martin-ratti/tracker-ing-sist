# Guía Práctica: Cómo Ejecutar y Escribir Tests (Unitarios, Integración y E2E) 🧪

Esta guía describe el flujo de trabajo para garantizar la calidad del código, ejecutar las suites de pruebas automatizadas y verificar la ausencia de errores de tipado o advertencias de linting en Tracker ISI.

---

## 🎯 Objetivo
Aprender a correr los tests en todos los niveles de la pirámide de testing (unitarios, integración y pruebas de extremo a extremo), generar reportes de cobertura y escribir nuevas pruebas para nuevas funcionalidades.

---

## 🏗️ Estructura del Ecosistema de Pruebas

| Nivel | Herramientas | Ubicación | Qué valida |
|---|---|---|---|
| **Linter Estático** | Oxlint | Monorepo (`.oxlintrc.json`) | Reglas de React 19, accesibilidad, sintaxis y buenas prácticas (política 0 warnings). |
| **Backend (Unit / API)** | Vitest, Supertest | [backend/src/test/](../../backend/src/test/) | Endpoints REST, tokens JWT, rate limiting y persistencia debounced. |
| **Frontend (Unit / RTL)** | Vitest, React Testing Library, JSDOM | [frontend/src/test/](../../frontend/src/test/) | Cálculo de correlatividades, cascadas, componentes visuales, atajos y modales. |
| **E2E (Navegador Real)** | Playwright | [e2e/](../../e2e/) | Flujos completos de usuario: cambio de temas, modales, interacción con la malla y responsividad móvil. |

---

## 1. Linter Ultrarrápido (`oxlint`)

El proyecto utiliza **Oxlint** (basado en el compilador Oxc en Rust) para un análisis estático casi instantáneo sin overhead de ESLint:

```bash
# Ejecutar oxlint en todo el monorepo
pnpm lint
```

> [!IMPORTANT]
> El proyecto aplica una estricta política de **0 advertencias y 0 errores**. Si Oxlint arroja una advertencia (por ejemplo, dependencias faltantes en `useEffect` o variables no utilizadas), el pipeline de CI fallará.

---

## 2. Pruebas Unitarias y de Integración (Vitest)

Para correr todos los tests de backend y frontend simultáneamente:

```bash
pnpm test
```

### Ejecutar solo en Frontend:
```bash
# Modo ejecución única
pnpm --filter frontend test

# Modo interactivo (Watch) mientras desarrollas
pnpm --filter frontend test:watch

# Ejecutar un archivo específico
pnpm --filter frontend test src/test/TrackerContext.test.tsx
```

### Ejecutar solo en Backend:
```bash
pnpm --filter tracker-backend test
```

---

## 3. Cobertura de Código (V8 Coverage)

Para evaluar qué porcentaje del código está cubierto por pruebas:

```bash
pnpm test:coverage
```

Este comando genera reportes en texto en la terminal y carpetas detalladas en HTML:
- `backend/coverage/index.html` (cobertura ~99% de líneas en servicios centrales y 100% en rutas/middlewares)
- `frontend/coverage/index.html` (cobertura ~85.3% de líneas general y 100% en motores académicos, utilitarios y componentes centrales)

---

## 4. Pruebas End-to-End con Playwright

Las pruebas E2E verifican el comportamiento de la interfaz simulando interacciones reales tanto en navegador de escritorio (`chromium`) como en emulación táctil móvil (`Mobile Chrome` sobre Pixel 5):

```bash
# Ejecutar todas las pruebas E2E en modo headless (23 tests)
pnpm test:e2e

# Abrir el explorador interactivo visual con UI
pnpm exec playwright test --ui

# Correr solo una suite específica (ej. búsqueda y filtros)
pnpm exec playwright test e2e/busqueda-filtros.spec.ts

# Correr exclusivamente el proyecto móvil
pnpm exec playwright test --project="Mobile Chrome"
```

### Configuración del Runner (`playwright.config.ts`)
- **`chromium` (Desktop Chrome):** Ejecuta todas las suites de escritorio (`testIgnore: /.*mobile\.spec\.ts/`).
- **`Mobile Chrome` (Pixel 5, 393×851 px):** Ejecuta exclusivamente las pruebas móviles adaptativas (`testMatch: /.*mobile\.spec\.ts/`).

### Suites Implementadas (12 suites, 23 escenarios):
- [e2e/malla.spec.ts](../../e2e/malla.spec.ts): Clicks en asignaturas, cambio de estados (Pendiente ➔ Regular ➔ Aprobada).
- [e2e/subject-modal.spec.ts](../../e2e/subject-modal.spec.ts): Carga de notas, libro, folio y fijación de metas de examen.
- [e2e/calendario.spec.ts](../../e2e/calendario.spec.ts): Apertura del calendario académico y navegación de turnos oficiales.
- [e2e/temas.spec.ts](../../e2e/temas.spec.ts): Cambio entre las 5 paletas cromáticas y alternancia claro/oscuro.
- [e2e/electivas.spec.ts](../../e2e/electivas.spec.ts): Filtrado por nivel y cómputo de horas acreditables.
- [e2e/stats-titles.spec.ts](../../e2e/stats-titles.spec.ts): Métricas, requisitos de ADUSI e Ingeniería y carga de horas PPS.
- [e2e/perfil-share.spec.ts](../../e2e/perfil-share.spec.ts): Edición de perfil del alumno, generación de enlaces y hash comprimido.
- [e2e/atajos-teclado.spec.ts](../../e2e/atajos-teclado.spec.ts): Accesibilidad completa y atajos de teclado globales.
- [e2e/busqueda-filtros.spec.ts](../../e2e/busqueda-filtros.spec.ts): Búsqueda en tiempo real por nombre, filtros por año y chips rápidos.
- [e2e/not-found.spec.ts](../../e2e/not-found.spec.ts): Página de error 404 ante rutas inválidas y retorno a la malla/grafo.
- [e2e/persistencia-backup.spec.ts](../../e2e/persistencia-backup.spec.ts): Persistencia en localStorage tras recarga (`page.reload()`) y modal de guía/ayuda.
- [e2e/mobile.spec.ts](../../e2e/mobile.spec.ts): Navegación táctil con `BottomNav`, drawer móvil `Más`, interacción en malla y modal de títulos.

---

## 5. Pipeline de CI/CD Automatizado (GitHub Actions)

El proyecto cuenta con un workflow unificado en [`.github/workflows/ci-cd.yml`](../../.github/workflows/ci-cd.yml) que se dispara automáticamente ante cada `push` o `pull_request`:

1. **Jobs de Validación Continua en Paralelo:**
   - **`lint`:** Ejecuta `oxlint` sobre `packages/types/src`, `frontend/src` y `backend/src` (exige 0 warnings y 0 errores en 123 archivos).
   - **`test-unit`:** Ejecuta `vitest` en backend y frontend (278 tests) generando reportes de cobertura V8 que se almacenan como artefactos (`upload-artifact`).
   - **`test-e2e`:** Instala navegadores de Playwright con cache y corre los 23 tests de escritorio y móvil.
   - **`build`:** Compila `@tracker/types`, `tracker-backend` y `frontend` con Vite y Rolldown.
2. **Despliegue Automático (CD):**
   - Si los 4 jobs previos aprueban satisfactoriamente en la rama `main`, el job `deploy` compila y despliega en producción en **Firebase Hosting**.
   - En pull requests, publica en un canal temporal de preview.

---

## 6. Escribir un Nuevo Test en Frontend

Al crear un nuevo componente o modificar la lógica de correlatividades, sigue este patrón usando `TrackerProvider`:

```tsx
// frontend/src/test/MiComponente.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrackerProvider } from '../context/TrackerContext';
import { MiComponente } from '../components/views/MiComponente';

describe('MiComponente', () => {
  it('renderiza correctamente y responde a clicks', async () => {
    const user = userEvent.setup();

    render(
      <TrackerProvider>
        <MiComponente />
      </TrackerProvider>
    );

    const boton = screen.getByRole('button', { name: /accion/i });
    expect(boton).toBeInTheDocument();

    await user.click(boton);
    expect(screen.getByText(/resultado/i)).toBeInTheDocument();
  });
});
```

