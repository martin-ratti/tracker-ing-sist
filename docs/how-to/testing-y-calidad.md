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
- `backend/coverage/index.html` (cobertura ~99%)
- `frontend/coverage/index.html` (cobertura ~87%)

---

## 4. Pruebas End-to-End con Playwright

Las pruebas E2E verifican el comportamiento de la interfaz simulando interacciones reales en navegadores Chromium, Firefox y WebKit:

```bash
# Ejecutar todas las pruebas E2E en modo headless
pnpm test:e2e

# Abrir el explorador interactivo visual con UI
pnpm exec playwright test --ui

# Correr solo una suite específica (ej. atajos de teclado)
pnpm exec playwright test e2e/atajos-teclado.spec.ts
```

Las suites existentes cubren:
- [e2e/malla.spec.ts](../../e2e/malla.spec.ts): Clicks en asignaturas, cambio de estados (Pendiente ➔ Regular ➔ Aprobada).
- [e2e/subject-modal.spec.ts](../../e2e/subject-modal.spec.ts): Carga de notas, libro, folio y fijación de metas de examen.
- [e2e/temas.spec.ts](../../e2e/temas.spec.ts): Cambio entre las 5 paletas cromáticas y persistencia.
- [e2e/mobile.spec.ts](../../e2e/mobile.spec.ts): Navegación con BottomNav en pantallas táctiles.

---

## 5. Escribir un Nuevo Test en Frontend

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

