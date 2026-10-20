# Documentación Técnica · Tracker UTN Sistemas (Plan 2023 · FRRo) 📚

Bienvenido al centro oficial de documentación técnica de **Tracker UTN Sistemas (Plan 2023 - UTN Facultad Regional Rosario)**.

Esta documentación ha sido diseñada siguiendo el marco metodológico **[Diátaxis](https://diataxis.fr/)**, organizando el conocimiento en cuatro cuadrantes fundamentales según la intención del lector:

```
                      APRENDIZAJE (Práctico)
                               ▲
                               │
            Tutoriales         │        Guías Prácticas (How-To)
       (Aprender haciendo)     │       (Resolver problemas reales)
                               │
    ───────────────────────────┼───────────────────────────► TRABAJO
                               │
            Explicaciones      │               Referencia
         (Comprender el porqué)│          (Consultar detalles técnicos)
                               │
                               ▼
                    CONOCIMIENTO (Teórico)
```

---

## 🗺️ Mapa de la Documentación

### 1. 🎓 Tutoriales (Learning-oriented)
Diseñados para guiar paso a paso a nuevos desarrolladores o colaboradores desde cero hacia un entorno funcional.
- [Primeros Pasos con Tracker ISI](./tutorials/primeros-pasos.md): Clonado, instalación con `pnpm`, variables de entorno, ejecución concurrente del frontend y backend, y primera contribución guiada.

### 2. 🛠️ Guías Prácticas / How-To (Problem-oriented)
Recetas directas para resolver tareas y problemáticas específicas de desarrollo y mantenimiento.
- [Cómo agregar o modificar asignaturas y electivas](./how-to/agregar-o-modificar-materias.md): Actualizar el catálogo de materias troncales y electivas del Plan 2023 manteniendo la paridad entre frontend y backend.
- [Cómo actualizar el calendario académico y turnos de examen](./how-to/actualizar-calendario-academico.md): Configurar turnos oficiales de examen, feriados fijos/móviles y reglas de inscripción de Sysacad.
- [Cómo ejecutar y escribir tests (Unitarios, Integración y E2E)](./how-to/testing-y-calidad.md): Ejecución y desarrollo de pruebas con Vitest, React Testing Library, Supertest y Playwright, junto al control de calidad con Oxlint.
- [Cómo compilar y desplegar en producción (Firebase Hosting)](./how-to/despliegue-en-produccion.md): Pipeline de compilación TypeScript + Vite (Rolldown) y despliegue a Firebase Hosting.

### 3. 📖 Referencia Técnica (Information-oriented)
Especificaciones formales, diccionarios de tipos, endpoints y descripciones exhaustivas de la maquinaria.
- [Modelo de Datos y Tipos TypeScript](./reference/modelo-de-datos.md): Definición canónica de `Materia`, `Electiva`, `EstadoMateria`, `ProgresoUsuario`, `MetaExamen` y validaciones.
- [Referencia de la API REST del Backend](./reference/api-backend.md): Contratos de endpoints `/api/auth/*`, `/api/plan` y `/api/progress`, códigos HTTP, JWT y limitadores de tasa.
- [Contextos React y Gestión del Estado](./reference/contextos-y-estado.md): Especificación de `TrackerContext`, `AuthContext`, `ThemeContext`, `UIContext` y custom hooks (`useFocusTrap`, `useKeyboardShortcuts`, `useHistoryBack`, `useModalAnimation`).
- [Monorepo, Herramientas y Scripts](./reference/arquitectura-monorepo.md): Estructura del workspace pnpm, scripts de automatización, configuración de Tailwind CSS v4 y Oxlint.

### 4. 💡 Explicaciones de Arquitectura (Understanding-oriented)
Artículos que profundizan en las decisiones de diseño, algoritmos subyacentes y conceptos arquitectónicos.
- [Motor de Correlatividades y Resolución en Cascada](./explanation/motor-de-correlatividades.md): Lógica de evaluación de requisitos para cursar vs. rendir, validación del Seminario Integrador ADUSI y reseteo recursivo en cascada.
- [Sincronización Híbrida y Fusión Inteligente (Merge Local ↔ Nube)](./explanation/sincronizacion-hibrida-y-merge.md): Filosofía Offline-First, almacenamiento dual (localStorage + Firestore/Express) y algoritmo de merge sin pérdida de datos.
- [Arquitectura Visual, Rendimiento y Accesibilidad](./explanation/arquitectura-visual-y-rendimiento.md): Code-splitting diferido para `vis-network`, motor de variables semánticas de Tailwind CSS v4 y estándares WCAG 2.2 AA.

---

## 🏛️ Material Oficial Complementario

En esta misma carpeta se encuentran digitalizados los documentos oficiales de la **UTN Facultad Regional Rosario**:
- [`docs/isi-a4-plan-2023-gradiente-utn-frro.pdf`](./isi-a4-plan-2023-gradiente-utn-frro.pdf): Cartilla oficial del Plan 2023 con correlatividades de cursado y aprobación.
- [`docs/electivas-plan-2023.png`](./electivas-plan-2023.png): Grilla oficial de electivas vigentes aprobadas por el Consejo Directivo.
- [`docs/calendario-2026-2027-gradiente.pdf`](./calendario-2026-2027-gradiente.pdf): Calendario académico oficial con los turnos de exámenes finales y recesos.

