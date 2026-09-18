# 📋 Plan de Acción Actualizado · Tracker UTN Sistemas (Plan 2023)

**Fecha de actualización:** 18 de Septiembre de 2026  
**Objetivo:** Consolidar todas las mejoras de UI/UX, rendimiento y arquitectura frontend/backend, preparando la aplicación para su posterior migración y despliegue en **Firebase (Hosting, Firestore y Auth)**.

---

## 1. Decisiones y Alcance Confirmado

Siguiendo las instrucciones del usuario, se descartaron los siguientes puntos:
- ❌ **Ítem 1 (PWA):** Descartado.
- ❌ **Ítem 2 (Backup/Export JSON manual):** Descartado (se priorizará persistencia en nube).
- ❌ **Ítem 3 (Simulador de Cursado Semestral):** Descartado.
- ❌ **Ítem 6 (Badge de impacto "Qué cursar primero"):** Descartado.

---

## 2. Estado de Implementación

### ✅ Fase A: Mejoras Ya Completadas y Verificadas (Compilación OK)
1. **[Ítem 4] Sistema de Toasts con Cola y Variantes Semánticas:**
   - Soporte para hasta 3 toasts simultáneos con animación y timer individual.
   - Variantes tipadas: `success`, `warning`, `error`, `info`.
   - Barra de progreso inferior animada y posibilidad de descartar por click (`Toast.tsx`).
2. **[Ítem 5] Transición Animada entre Vistas:**
   - Animación fluida `viewFadeIn` (`.view-transition-enter`) al alternar entre Grafo de Red y Malla Curricular (`App.tsx`, `index.css`).
3. **[Ítem 7] Modo Claro (Light Mode):**
   - Incorporación de paleta `light` completa en `index.css` con variables CSS adaptadas y textos contrastados (`--text-body`).
   - Soporte en `ThemeContext.tsx` y aparición automática en `ThemeSelector.tsx`.
4. **[Ítem 8] Dashboard de Estadísticas Avanzadas:**
   - Componente `StatsModal.tsx` con gráfico circular en CSS puro (`conic-gradient`), métricas clave, barras de progreso por año y timeline cronológico de exámenes aprobados.
   - Integrado en `Header.tsx` (versión escritorio y móvil) y `App.tsx`.
5. **[Ítem 9] Atajos de Teclado Globales:**
   - Hook `useKeyboardShortcuts.ts` con protección de inputs/formularios.
   - Teclas rápidas: `G` (Grafo), `M` (Malla), `E` (Electivas), `C` (Calendario), `R` (Reporte PDF), `P` (Perfil), `?` (Ayuda).
6. **[Ítem 11] Componentes UI Base Reutilizables:**
   - `Modal.tsx` con accesibilidad WCAG (`useFocusTrap`, `Escape`, backdrop).
   - `StatusBadge.tsx` para visualización uniforme de estados en la app.
7. **[Ítem 13] Manejo de Errores con Error Boundary:**
   - `ErrorBoundary.tsx` con UI de rescate elegante que previene la pantalla en blanco ante caídas del motor de red.
8. **[Ítem 15] Correcciones Críticas de Backend:**
   - CORS estricto configurable (`server.ts`).
   - Consistencia de `DATA_DIR` (`backend/data`) en `userService.ts`.
   - Advertencia preventiva si se ejecuta sin `JWT_SECRET` en producción (`jwtService.ts`).

---

## 3. Próximos Pasos Inmediatos (Fase Frontend & Arquitectura)

Antes de iniciar la integración de Firebase, se completarán las siguientes optimizaciones clave de la interfaz:

- [ ] **Paso 1: [Ítem 14] Optimización de Rendimiento en Grafo (`NetworkGraph.tsx`):**
  - Implementar diffing de nodos mediante `useRef` para actualizar únicamente los nodos que hayan cambiado de estado o dependencias, reduciendo el trabajo del canvas y evitando re-renderizados innecesarios.
- [ ] **Paso 2: [Ítem 12] Pulido de Contrastes en Modo Claro:**
  - Ajustar colores hardcodeados de fondos en modales y cartillas (`GridView.tsx`, `SubjectModal.tsx`, `Header.tsx`) para que usen variables semánticas (`--bg-surface`, `--bg-elevated`, etc.) y luzcan 100% legibles tanto en fondos oscuros como en el tema claro.
- [ ] **Paso 3: [Ítem 16] Modo Compartir Progreso por URL (Solo Lectura):**
  - Permitir a los alumnos generar un enlace compartible con su progreso codificado de forma compacta en la URL (`#share=...`), permitiendo que compañeros o docentes visualicen su avance sin necesidad de registrarse.
- [ ] **Paso 4: Auditoría de Lint y Build:**
  - Verificación estricta con `oxlint` y compilación completa del monorepo (`pnpm build`).

---

## 4. Fase Posterior: Integración con Firebase

Una vez finalizadas y validadas las mejoras anteriores, se procederá con la arquitectura de Firebase:

1. **Configuración de Firebase en el Proyecto:**
   - Instalación de dependencias `firebase` en el frontend.
   - Creación de configuración modular `src/services/firebase.ts`.
   - Inicialización de `firebase.json` y `.firebaserc`.
2. **Autenticación (Firebase Auth):**
   - Habilitación de inicio de sesión con Correo/Contraseña y Google Sign-In (1-click con cuenta institucional o personal).
   - Adaptación de `AuthContext.tsx` para usar observadores de estado `onAuthStateChanged`.
3. **Persistencia en la Nube (Cloud Firestore):**
   - Colección `users/{userId}/progress` con sincronización en tiempo real (`onSnapshot`).
   - Soporte offline nativo de Firestore con caché persistente en navegador (IndexedDB).
   - Fusión inteligente de progreso local a Firestore al autenticarse.
4. **Despliegue (Firebase Hosting):**
   - Configuración de reglas de reescritura SPA (`rewrites: [ { "source": "**", "destination": "/index.html" } ]`).
   - Script de build y deploy optimizado (`firebase deploy --only hosting,firestore`).
