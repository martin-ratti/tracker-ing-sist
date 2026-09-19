# 📋 Plan de Acción Actualizado · Tracker UTN Sistemas (Plan 2023)

**Fecha de actualización:** 18 de Septiembre de 2026  
**Objetivo:** Consolidar todas las mejoras de UI/UX, rendimiento y arquitectura frontend/backend, integrando y desplegando la aplicación en **Firebase (Hosting, Firestore y Auth)**.

---

## 1. Decisiones y Alcance Confirmado

Siguiendo las instrucciones del usuario, se descartaron los siguientes puntos:
- ❌ **Ítem 1 (PWA):** Descartado.
- ❌ **Ítem 2 (Backup/Export JSON manual):** Descartado (reemplazado por persistencia en nube con Firebase).
- ❌ **Ítem 3 (Simulador de Cursado Semestral):** Descartado.
- ❌ **Ítem 6 (Badge de impacto "Qué cursar primero"):** Descartado.

---

## 2. Estado de Implementación

### ✅ Fase A: Mejoras Completadas y Verificadas (Compilación OK)
1. **[Ítem 4] Sistema de Toasts con Cola y Variantes Semánticas:**
   - Soporte para hasta 3 toasts simultáneos con animación y timer individual.
   - Variantes tipadas: `success`, `warning`, `error`, `info`.
   - Barra de progreso inferior animada y descarte al click (`Toast.tsx`).
2. **[Ítem 5] Transición Animada entre Vistas:**
   - Animación fluida `viewFadeIn` (`.view-transition-enter`) al alternar entre Grafo de Red y Malla Curricular (`App.tsx`, `index.css`).
3. **[Ítem 7] Modo Claro (Light Mode):**
   - Incorporación de paleta `light` completa en `index.css` con variables CSS adaptadas y textos contrastados (`--text-body`).
   - Soporte en `ThemeContext.tsx` y botón conmutador Sun/Moon en `Header.tsx`.
4. **[Ítem 8] Dashboard de Estadísticas Avanzadas:**
   - Componente `StatsModal.tsx` con gráfico circular en CSS puro (`conic-gradient`), métricas clave, barras de progreso por año y timeline cronológico de exámenes aprobados.
   - Totalmente integrado en `Header.tsx` y accesible desde interfaz y atajos.
5. **[Ítem 9] Atajos de Teclado Globales:**
   - Hook `useKeyboardShortcuts.ts` con protección de inputs/formularios.
   - Teclas rápidas: `G` (Grafo), `M` (Malla), `E` (Electivas), `C` (Calendario), `R` (Reporte PDF), `P` (Perfil), `S` (Compartir), `?` (Ayuda).
6. **[Ítem 11] Componentes UI Base Reutilizables:**
   - `Modal.tsx` con accesibilidad WCAG (`useFocusTrap`, `Escape`, backdrop).
   - `StatusBadge.tsx` para visualización uniforme de estados en la app.
7. **[Ítem 13] Manejo de Errores con Error Boundary:**
   - `ErrorBoundary.tsx` con UI de rescate que previene pantalla en blanco ante caídas del motor de red.
8. **[Ítem 14] Optimización de Rendimiento en Grafo (`NetworkGraph.tsx`):**
   - Diffing de nodos y aristas con mapas de firmas (`prevNodeSignaturesRef` y `prevEdgeSignaturesRef`).
   - Extracción de constante `MATERIAS_GRAFO` al nivel de módulo para evitar re-cálculos de dependencias en renders sucesivos.
9. **[Ítem 12] Pulido de Contrastes en Modo Claro:**
   - Adaptación de textos y contenedores en `GridView.tsx`, `SubjectModal.tsx`, `StatsModal.tsx` y `Header.tsx` a variables semánticas (`--bg-surface`, `--bg-elevated`, `--text-body`, `--border-color`).
10. **[Ítem 16] Modo Compartir Progreso por URL (Solo Lectura):**
    - Codificación compacta y segura en URL hash (`#share=...`) mediante `encodeProgress` y `decodeProgress`.
    - Detección reactiva (`hashchange`), banner informativo de modo lectura, botón para importar progreso y atajo `S` documentado en `HelpModal.tsx`.
11. **[Ítem 15] Backend & Monorepo:**
    - CORS estricto configurable en `server.ts`.
    - Monorepo pnpm configurado con scripts paralelos `pnpm dev` y `pnpm build`.

---

## 3. ✅ Fase Firebase: Integración y Despliegue en Producción

- [x] **Configuración del SDK y Proyecto:**
  - Archivos `.env` en raíz y `frontend/.env` con credenciales oficiales del proyecto `tracker-isi-utn-6f213`.
  - Configuración de `firebase.json` y `.firebaserc` (`default: tracker-isi-utn-6f213`).
  - `.gitignore` y `frontend/.gitignore` reforzados para proteger claves locales.
- [x] **Firebase Authentication:**
  - Habilitación e integración de Google Sign-In (`GoogleAuthProvider`) y Email/Password en `AuthContext.tsx`.
- [x] **Cloud Firestore:**
  - Reglas de seguridad (`firestore.rules`) desplegadas que protegen cada documento bajo `users/{userId}`.
  - Sincronización en tiempo real (`onSnapshot`) con fallback offline en `localStorage`.
- [x] **Firebase Hosting:**
  - App compilada (`pnpm build`) y desplegada en la nube con `firebase deploy`.
  - **URL de Producción Activa:** [https://tracker-isi-utn-6f213.web.app](https://tracker-isi-utn-6f213.web.app)
