# Explicación Técnica: Visualización de Correlatividades y Flechas en el Grafo 🕸️

Este documento registra el análisis técnico, los requerimientos planteados y las soluciones implementadas respecto a la visualización de aristas (flechas de correlatividades) en el Grafo de Red interactivo (`vis-network`) del Tracker ISI (Plan 2023 · UTN FRRo).

---

## 🎯 1. ¿Qué se quería hacer? (Requerimientos)

1. **Resolver error de TypeScript TS2580 en `playwright.config.ts`:**
   El editor marcaba `Cannot find name 'process'` en múltiples líneas de la configuración de Playwright.
2. **Clarificar y corregir la visualización de flechas en el Grafo de Red:**
   El usuario detectó que el grafo parecía indicar únicamente requisitos de aprobación de materias y no de regularidad.
3. **Caso testigo reportado (Inteligencia Artificial #31):**
   Al inspeccionar la materia *Inteligencia Artificial* (5° año), la ficha modal indicaba 3 requisitos para cursar (*Simulación* regular, *Probabilidad* aprobada y *Análisis Numérico* aprobada), pero en la visualización del grafo se observaban únicamente 2 flechas entrantes.

---

## 🔍 2. Diagnóstico Técnico

### A. Error TS2580 (`process` no encontrado)
- **Causa:** En el monorepo gestionado por `pnpm`, las dependencias de los workspaces hijos (`frontend/` y `backend/`) están aisladas. Aunque ambos paquetes tenían `@types/node`, el `package.json` de la raíz no lo declaraba.
- Al abrir `playwright.config.ts` en la raíz, el Language Server de TypeScript no encontraba las declaraciones globales de Node.js.

### B. El misterio de las flechas en el Grafo
Al auditar `NetworkGraph.tsx`, `graphStyles.ts` y `Header.tsx`, se detectaron 4 factores concurrentes:

1. **Filtros con etiquetas académicamente ambiguas:**
   - En el encabezado existían los botones *"Para Cursar"* y *"Para Rendir"*.
   - *"Para Cursar"* activaba `edgeMode === 'regular'`, mostrando únicamente aristas de `reqRegular`.
   - *"Para Rendir"* activaba `edgeMode === 'aprobada'`, mostrando únicamente aristas de `reqAprobada`.
   - **Realidad Académica (Plan 2023):** En UTN Sistemas, `reqAprobada` **también** son requisitos exigidos *para cursar* (con examen final aprobado previo). Por tanto, al hacer clic en *"Para Rendir"*, el sistema ocultaba la flecha de *Simulación* (que pide regularidad), dejando únicamente las 2 flechas de aprobación (*Probabilidad* y *Análisis Numérico*).
2. **Falta de diferenciación de trazo:**
   - Tanto las flechas de regularidad como las de aprobación se renderizaban como líneas sólidas continuas de grosor similar.
3. **Color dominado por el progreso del alumno:**
   - Si una materia de origen estaba aprobada (por ejemplo, *Álgebra*), su flecha saliente se pintaba de verde, aun cuando la materia destino solo exigía tenerla regularizada. Esto hacía que el grafo se llenara de flechas verdes ("aprobadas").
4. **Tooltips silenciados:**
   - La opción `tooltipDelay: 99999` en la configuración de `vis-network` impedía que el usuario pudiera pasar el mouse sobre una flecha para ver qué materia representaba y qué condición exigía.

---

## 🛠️ 3. Soluciones Implementadas

### 1. Resolución de Tipos de Node en la Raíz
- Se instaló `@types/node` en las `devDependencies` de la raíz del monorepo (`pnpm add -D -w @types/node`).
- Se importó explícitamente `import process from 'node:process';` en [playwright.config.ts](../../playwright.config.ts).

### 2. Diferenciación Visual del Trazo de Flechas
En [NetworkGraph.tsx](../../frontend/src/components/views/NetworkGraph.tsx) y [graphStyles.ts](../../frontend/src/components/views/graph/graphStyles.ts):
- **Flechas de Regularidad (`tipo === 'regular'`):**
  - Trazo **punteado / discontinuo** (`dashes: [6, 4]`).
  - Punta de flecha con escala sutil (`scaleFactor: 0.45`).
- **Flechas de Aprobación (`tipo === 'aprobada'`):**
  - Trazo **sólido continuo** (`dashes: false`).
  - Punta de flecha destacada (`scaleFactor: 0.55`).

### 3. Tooltips Descriptivos Nativos (`vis-network`)
- Se configuró `tooltipDelay: 200` en las opciones de interacción del grafo.
- Cada flecha ahora cuenta con un título explicativo al pasar el cursor:
  - `${Origen} ➔ ${Destino} (Req. Regular)`
  - `${Origen} ➔ ${Destino} (Req. Aprobada)`
- Cada nodo de materia también muestra su nombre completo, nivel y carga horaria.

### 4. Renombrado de Filtros en Header y Menú Móvil
En [Header.tsx](../../frontend/src/components/layout/Header.tsx):
- **"Todas":** Muestra el mapa integral de correlatividades (a IA le llegan sus 3 flechas: 1 punteada y 2 continuas).
- **"Req. Regular":** Muestra únicamente las aristas que exigen regularidad (punteadas).
- **"Req. Aprobada":** Muestra únicamente las aristas que exigen examen final aprobado (continuas).

### 5. Ocultamiento Limpio en el Motor de Grafo
- Se propagó la propiedad nativa `hidden: boolean` en la interfaz `EdgeVisualResult` y en la mutación del `DataSet<VisEdge>`.
- Al alternar filtros o modos de visualización, `vis-network` omite completamente las aristas filtradas, eliminando cualquier residuo o artefacto visual de transparencia.

### 6. Leyenda Inferior Actualizada
En la esquina inferior izquierda de [NetworkGraph.tsx](../../frontend/src/components/views/NetworkGraph.tsx):
- Indicador visual `- - - Req. Regular` (línea punteada color regular).
- Indicador visual `─── Req. Aprobada` (línea sólida color aprobada).

---

## 🧪 4. Verificación y Resultados

| Validación | Resultado | Detalle |
|---|---|---|
| **Linter (`oxlint`)** | ✅ 0 errores, 0 warnings | Ejecutado sobre 130 archivos del monorepo |
| **Backend Tests (`vitest`)** | ✅ 63/63 pasados | Autenticación, JWT, APIs, emails |
| **Frontend Tests (`vitest`)** | ✅ 236/236 pasados | Componentes, filtros, grafo, contextos |
| **Total Tests** | ✅ 299/299 pasados | 100% éxito |

---

*Documento generado para registrar las decisiones técnicas de la sesión del 27/10/2026.*
