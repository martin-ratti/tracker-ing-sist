# Explicación: Arquitectura Visual, Rendimiento y Accesibilidad 🎨⚡

Este documento explica las decisiones de diseño arquitectónico detrás de la interfaz de usuario de Tracker ISI: la estrategia de carga diferida (code-splitting), el motor semántico de temas en Tailwind CSS v4 y las pautas de accesibilidad WCAG 2.2 AA.

---

## ⚡ 1. Estrategia de Carga y Rendimiento: Code-Splitting del Grafo

La biblioteca [`vis-network`](https://github.com/visjs/vis-network) (junto con su motor de manipulación de datos `vis-data`) es la encargada de renderizar el grafo de dependencias jerárquico. Sin embargo, su tamaño compilado supera los **760 kB**, lo que representaría una penalización inaceptable para el tiempo de carga inicial (*First Contentful Paint* y *Time to Interactive*) si se incluyera en el bundle principal.

### Solución Implementada: Carga Perezosa (`React.lazy`)
En [frontend/src/App.tsx](../../frontend/src/App.tsx):

```tsx
// Carga diferida en un chunk separado (NetworkGraph.chunk.js)
const NetworkGraph = React.lazy(() => import('./components/views/NetworkGraph'));
```

### Reglas Arquitectónicas Asociadas:
1. **Aislamiento en Barrel Exports:** El componente `NetworkGraph` **nunca debe exportarse estáticamente** en `frontend/src/components/views/index.ts`. Si se re-exportara allí, cualquier importación de otros componentes de vista rompería el aislamiento y arrastraría `vis-network` al bundle inicial.
2. **Fallback Accesible:** Durante la carga del chunk, se renderiza un esqueleto con `Suspense` manteniendo las dimensiones del contenedor para evitar saltos de diseño acumulados (*Cumulative Layout Shift - CLS*).
3. **Dispositivos Móviles:** En pantallas menores a 768px de ancho, la aplicación inicia por defecto en la vista de **Malla Curricular** (`GridView`), postergando la descarga de `vis-network` hasta que el usuario decida explícitamente alternar a la vista de grafo.

---

## 🎨 2. Motor de Temas con Tailwind CSS v4

La aplicación soporta 5 temas visuales de alto contraste (*Cyber Blueprint*, *Neon Synthwave*, *Emerald Matrix*, *Amber Sunset* y *Nordic Frost*) en variantes oscura y clara.

### Arquitectura de Variables CSS Semánticas
En lugar de forzar clases estáticas o recrear componentes, Tailwind CSS v4 se alimenta de tokens nativos definidos en [frontend/src/index.css](../../frontend/src/index.css):

```css
@theme {
  --color-base: var(--bg-base);
  --color-surface: var(--bg-surface);
  --color-border: var(--border-color);
  --color-title: var(--text-title);
  --color-body: var(--text-body);
}

[data-theme='cyber'] {
  --bg-base: #070b13;
  --bg-surface: #0b101c;
  --border-color: #1e293b;
  --text-title: #f8fafc;
  --status-cursable: #22d3ee;
  --status-regular: #f59e0b;
  --status-approved: #10b981;
}

[data-theme='synthwave'] {
  --bg-base: #13091f;
  --bg-surface: #1e0e33;
  --border-color: #3b1d66;
  --text-title: #fdf4ff;
  --status-cursable: #f43f5e;
  --status-regular: #fbbf24;
  --status-approved: #2dd4bf;
}
```

### Sintaxis Canónica en Componentes
Para garantizar compatibilidad nativa con el motor de Tailwind v4:
- ✅ Se utiliza la sintaxis moderna con paréntesis: `bg-(--bg-surface)`, `text-(--text-title)`.
- ❌ Se prohíbe la sintaxis heredada con corchetes: `bg-[var(--bg-surface)]`.

Al cambiar de tema en [frontend/src/context/ThemeContext.tsx](../../frontend/src/context/ThemeContext.tsx), solo se actualiza el atributo `data-theme` en la etiqueta `<html>`, provocando un re-pintado instantáneo en GPU sin re-renderizar el árbol virtual del DOM de React.

---

## ♿ 3. Accesibilidad Universal (WCAG 2.2 AA)

El proyecto prioriza la usabilidad completa para usuarios que navegan mediante lectores de pantalla o únicamente con teclado:

### 1. Atrapado de Foco (`useFocusTrap`)
En [frontend/src/hooks/useFocusTrap.ts](../../frontend/src/hooks/useFocusTrap.ts):
- Cuando se abre cualquier modal (`SubjectModal`, `CalendarModal`, `ProfileModal`, etc.), el foco del teclado queda confinado dentro del diálogo.
- Al pulsar `Tab` en el último elemento interactivo, el foco regresa al primero (y con `Shift + Tab` a la inversa).
- Al cerrarse el modal con `Escape` o botón de cierre, el foco vuelve automáticamente al botón que disparó la acción.

### 2. Atributos Semánticos y Roles ARIA
- Los modales utilizan `role="dialog"`, `aria-modal="true"` y `aria-labelledby`.
- Las tarjetas de materias indican su estado accesible mediante texto explícito y no exclusivamente a través del color (`aria-label="Análisis Matemático I: Regular, habilitada para rendir final"`), cumpliendo el criterio WCAG 1.4.1 (Uso del color).

### 3. Ratio de Contraste Cromático
Todas las paletas han sido calibradas para superar el ratio de contraste mínimo de **4.5:1** para texto normal y **3:1** para componentes de interfaz según el estándar WCAG 2.2 AA.
