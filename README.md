# Tracker UTN Sistemas · Plan 2023 (FRRo) 🚀

Plataforma web interactiva para el seguimiento del plan de estudio de **Ingeniería en Sistemas de Información (Plan 2023 - UTN Facultad Regional Rosario)**. Permite gestionar correlatividades en tiempo real, visualizar el árbol de dependencias, registrar finales y notas, y monitorear el progreso hacia los títulos de **ADUSI** e **Ingeniería**.

Inspirado en el diseño original de [Tracker Plan de Estudio](https://tracker-plan-de-estudio.vercel.app/index.html) por Lucas Alonso, reescrito con arquitectura moderna: **React 19 + TypeScript** en el frontend y **Node.js + Express** en el backend.

🌐 **Sitio Web Oficial:** [https://utn-sistemas-frro.web.app](https://utn-sistemas-frro.web.app)

---

## ⚡ Características Principales

- 🌐 **Grafo Interactivo de Correlativas & Camino Crítico:**
  - Visualizador de red jerárquico por niveles utilizando `vis-network` standalone optimizado.
  - **Modo Camino Crítico:** selector en pantalla para alternar entre "Alternar Estado" e "Inspeccionar Dependencias". Al hacer clic en un nodo, ilumina toda la cadena de requisitos previos (ancestros) y las materias que desbloquea (descendientes), atenuando el resto de nodos no relacionados (`opacity: 0.15`).
  - Banner informativo en vivo con botón para restablecer el enfoque.
  - Estados reactivos sincronizados con el tema visual:
    - ⚪ **Pendiente / Bloqueada:** Requisitos previos incompletos.
    - 🔵 **Cursable (Brillante con Animación):** Habilitada para anotarse a cursar.
    - 🟡 **Regular:** Cursada acreditada, lista para rendir examen final.
    - 🟢 **Aprobada:** Examen final o promoción aprobada.
  - Filtro dinámico de conexiones: *Todas*, *Solo para Cursar* (regulares) y *Solo para Rendir* (aprobadas).
  - Controles ergonómicos superiores: Zoom in/out, ajustar pantalla, orientación jerárquica (Vertical/Horizontal) y switch de Modo Libre fijado a la derecha para interactuar con fluidez sin saltos bajo el cursor.

- 📋 **Vista Dual: Grafo de Red / Malla Curricular con Filtros Rápidos:**
  - Alterná con un clic entre el grafo de relaciones y una cuadrícula interactiva estilo cartilla física organizada por niveles (1º a 5º año).
  - **Filtros Rápidos Tipo Chip:** *Todas*, *Cursables*, *Regulares*, *Aprobadas* y *Con Meta 🎯* con contadores en vivo.
  - Buscador predictivo por nombre o código de materia.
  - Barras de progreso de avance porcentual individuales por nivel académico.
  - **Distintivo 'Regular 🎯 (Lista para Rendir)':** Diferencia visualmente las materias regularizadas que ya tienen todas sus correlativas de final aprobadas y están expeditas para rendir.
  - Badges contextuales de metas agendadas con cuenta regresiva en días.

- 📅 **Agenda de Mesas de Finales & Metas Tentativas (Calendario 2026-2027):**
  - Integración del Calendario Académico Oficial de UTN FRRo (`docs/calendario-2026-2027-gradiente.pdf`).
  - Selección de turno de examen (16 turnos oficiales entre Feb 2026 y Mar 2027) para cualquier materia regular.
  - Cuenta regresiva automática en días ("Faltan 12 días", "¡Es hoy!").
  - Modal del Calendario Académico (`CalendarModal.tsx`) con pestañas para "Mis Metas Activas", lista cronológica de turnos, acceso directo a Sysacad Alumnos y directivas de cierre (18:00 hs del penúltimo día hábil).

- 📬 **Notificaciones Automáticas por Correo (Resend):**
  - **Email de bienvenida institucional:** Diseño HTML responsivo y personalizado al registrarse o iniciar sesión en el Tracker.
  - **Recordatorios de exámenes:** Alerta automática por correo **7 días antes** de cada mesa de examen agendada con enlace directo a Sysacad Alumnos (`https://alumnos.frro.utn.edu.ar/loginAlumno.asp?refrescar`), fecha exacta, llamado y checklist previo al examen.
  - **Scheduler en segundo plano:** Tarea periódica diaria en el backend Express para revisar metas y evitar duplicación de notificaciones.
  - **Script de prueba:** Ejecución de pruebas de envío con `pnpm --filter tracker-backend test:email`.

- 📄 **Ficha Curricular y Analítico Oficial en PDF (jsPDF + Autotable):**
  - **Generación Vectorial Nativa:** Motor cliente integrado con `jsPDF` y `jspdf-autotable` para compilar y descargar directamente un documento formal `.pdf` (`Ficha_Curricular_UTN_ISI_[legajo].pdf`) sin depender de diálogos del navegador.
  - **Membrete Institucional Oficial:** Identificación formal de la Universidad Tecnológica Nacional (UTN), Facultad Regional Rosario (FRRo), Departamento de Ingeniería en Sistemas de Información, isotipo institucional y fecha/hora exacta de emisión.
  - **Ficha del Estudiante:** Identificación de Nombre, Legajo universitario y Carrera.
  - **Tarjetas Métricas Académicas:** Cuatro indicadores destacados con porcentaje de avance de carrera, promedio académico de materias aprobadas, horas de electivas acreditadas (metas 4 hs / 20 hs) y horas de Práctica Profesional Supervisada (PPS vs 200 hs).
  - **Grilla Analítica Completa por Nivel (1º a 5º Año):** Tablas organizadas por año con código de asignatura (`#XX`), denominación oficial, régimen de cursado (cuatrimestral o anual), carga horaria, estado académico coloreado (`APROBADA` en verde esmeralda, `REGULAR` en ámbar y `PENDIENTE` en gris pizarra) y calificación final.
  - **Sección de Asignaturas Electivas Acreditadas:** Tabla con denominación, nivel cursado, horas computadas y estado.
  - **Metas Tentativas de Examen Agendadas:** Registro de turnos de examen y fechas estimadas para próximos finales.
  - **Paginación Formal:** Foliación automática institucional (`Página X de Y`) y pie de página en todas las hojas.
  - **Doble Modalidad:** Descarga directa en archivo `.pdf` con botón "Descargar PDF" y compatibilidad completa con `@media print` para impresión física directa o guardado A4. Atajo de teclado: **`R`**.

- 💾 **Copia de Seguridad y Migración Local en JSON (.json):**
  - **Exportar Copia de Respaldo:** Descarga instantánea de un archivo `.json` (`tracker-isi-[legajo]-[fecha].json`) con todo el progreso: estados de cursada, notas de exámenes, fechas, libros/folios, horas de PPS, metas de finales y datos del estudiante (`backupManager.ts`).
  - **Restaurar Copia:** Importación directa de archivos `.json` con validación y sanitización segura contra datos maliciosos, permitiendo trasladar avances entre computadoras o navegadores sin necesidad obligatoria de registrarse en la nube.

- 📂 **Integración Comunitaria de Material de Estudio (Google Drive):**
  - Acceso directo al **Drive General de la Carrera** desde el encabezado superior y menú móvil con resúmenes, libros y apuntes comunitarios.
  - Acceso al **Drive de Asignaturas Electivas** desde los paneles de electivas.
  - Enlaces contextuales en cada materia (`SubjectModal.tsx` y `GridView.tsx`) para saltar directamente a la carpeta de material de la cátedra y a la subcarpeta de exámenes y parciales resueltos.

- 📆 **Exportación de Metas a Calendarios Personales (.ics / iCalendar):**
  - Exportación de las mesas de exámenes agendadas a formato de eventos `.ics` (`icsExporter.ts`), compatible con Google Calendar, Apple Calendar y Microsoft Outlook.

- 👤 **Perfil Universitario del Alumno:**
  - Modal interactivo para configurar Nombre y Legajo estudiantil (`ProfileModal.tsx`).
  - Botón de acceso directo para descargar la **Ficha Analítica PDF** con membrete oficial tras completar los datos.
  - Persistencia automática tanto en local como en la nube.
  - Avatar con iniciales en la barra superior y atajo de teclado: **`P`**.

- 🔄 **Fusión Inteligente de Progreso (Merge Local ↔ Nube):**
  - Al iniciar sesión con datos existentes en el dispositivo, ofrece fusionar de forma inteligente para no perder avances, dando prioridad al estado más avanzado, combinando notas y conservando metas de examen.

- 🎨 **Sistema Dinámico de 5 Temas Visuales:**
  - Selector de paletas cromáticas accesibles desde la barra superior:
    - **Cyber Blueprint:** Estética clásica cian tech y azul noche.
    - **Neon Synthwave:** Púrpura retrofuturista con rosa fucsia, violeta y turquesa.
    - **Emerald Matrix:** Verde hacker terminal con tonos menta y lima.
    - **Amber Sunset:** Paleta solar cálida con ámbar, naranja fuego y esmeralda.
    - **Nordic Frost:** Azul glacial nórdico con índigo y turquesa polar.
  - Toda la interfaz (malla, grafo, modales, contadores métricos, botones y leyenda) se sincroniza reactivamente.

- ☁️ **Sincronización en la Nube con Cuentas de Usuario (Arquitectura Híbrida):**
  - **Firebase Authentication & Cloud Firestore (Producción):** Registro con email/contraseña o inicio de sesión con Google en un clic, con almacenamiento persistente y sincronización reactiva multi-dispositivo (PC, celular, tablet).
  - **Backend API REST Node.js + Express (Auto-hospedado):** Soporte alternativo con tokens JWT, contraseñas cifradas con `bcrypt` y protección con limitador de tasa (*Rate Limiter*).
  - **Modo Local Offline-First:** Si preferís no registrarte, podés usar el tracker al 100% en local mediante `localStorage`.
  - **Fusión Inteligente (Merge Local ↔ Nube):** Al iniciar sesión con datos existentes en el dispositivo, fusiona de forma inteligente para no perder avances, dando prioridad al estado más avanzado, combinando notas y conservando metas de examen.

- 🛡️ **Validación Estricta y Reseteo en Cascada:**
  - No permite marcar estados inválidos si faltan correlativas. Muestra alertas contextuales (*Toast*) indicando con precisión qué materias faltan regularizar o aprobar.
  - **Seminario Integrador ADUSI:** Validación oficial que exige tener aprobadas las 23 materias de 1º, 2º y 3º año para poder asentarlo como aprobado.
  - Si una materia correlativa vuelve a "Pendiente", el sistema recalcula en cascada e invalida de forma recursiva todas las materias dependientes para garantizar consistencia académica.
  - **Diálogo Protector de Cascada (`CascadeConfirmModal`):** Si desmarcar una asignatura resetea más de 3 materias correlativas avanzadas, solicita confirmación explícita con el listado detallado de materias afectadas.
  - **Acción 'Deshacer' Inmediata:** Notificación flotante con botón *Deshacer* para revertir al instante reseteos accidentales y restaurar estados y notas previas en un solo clic.

- 🎓 **Seguimiento de Doble Titulación:**
  - **ADUSI (Analista Desarrollador Universitario en Sistemas de Información):**
    - 1º, 2º y 3º año completos (23 materias) + Seminario Integrador ADUSI + 4 hs de electivas.
  - **Ingeniería en Sistemas de Información:**
    - 36 materias troncales + 20 hs de electivas + 200 hs de Prácticas Profesionales Supervisadas (PPS).
    - Barra interactiva para cargar las horas de PPS realizadas.

- ✨ **Panel Inteligente de Electivas:**
  - Catálogo completo con las 19 materias electivas oficiales del Plan 2023 de UTN FRRo.
  - Cómputo directo de horas reales según normativa de la facultad.
  - Indicadores de meta para 4 hs (ADUSI) y 20 hs (Ingeniería).

- 🔍 **Detalle Integral de Asignatura y Correlativas para Rendir:**
  - **Discriminación de Requisitos en Tiempo Real:** Visualización en dos columnas de requisitos para cursar (regulares/aprobadas) vs. requisitos para rendir final (regularidad y lista explícita de materias previas que deben estar aprobadas con badges OK / Falta).
  - **Planificación Temprana y Alertas:** Advertencia informativa preventiva al programar una meta de final si todavía restan correlativas previas por aprobar.
  - **Preservación Segura de Notas:** Las calificaciones guardadas se conservan de forma no destructiva y solo se computan al promedio cuando la materia se encuentra aprobada.

- 📝 **Libreta de Exámenes y Promedios:**
  - Formulario completo para registrar calificación (1 a 10), fecha de examen, libro, folio y anotaciones sobre la cátedra.
  - Cálculo automático en tiempo real del promedio de asignaturas aprobadas.

- ⌨️ **Atajos Rápidos de Teclado (Navegación Fluida):**
  - Acceso inmediato a cualquier vista o función sin necesidad de usar el cursor (`useKeyboardShortcuts.ts`):
    - <kbd>G</kbd> : Vista Grafo de Correlatividades
    - <kbd>M</kbd> : Vista Malla Curricular
    - <kbd>E</kbd> : Panel de Asignaturas Electivas
    - <kbd>C</kbd> : Calendario Académico de Finales
    - <kbd>T</kbd> : Panel de Títulos (ADUSI / Ingeniería)
    - <kbd>R</kbd> : Ficha Curricular y Analítico en PDF
    - <kbd>P</kbd> : Perfil del Alumno y Copia de Seguridad
    - <kbd>S</kbd> : Compartir Avance (enlace comprimido)
    - <kbd>A</kbd> : Iniciar Sesión / Gestionar Cuenta
    - <kbd>?</kbd> : Guía Interactiva y Atajos
    - <kbd>Escape</kbd> : Cerrar cualquier diálogo o panel modal activo

- ♿ **Accesibilidad WCAG 2.2 AA:**
  - Soporte completo de navegación por teclado con foco atrapado en modales (`useFocusTrap`).
  - Etiquetas ARIA semánticas, contraste visual riguroso y diálogos accesibles.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TypeScript (~6.0), Vite 8 (Rolldown), Tailwind CSS v4, Vis-Network, jsPDF, jspdf-autotable, Lucide Icons |
| **Backend & Nube** | Firebase Hosting, Firebase Auth, Cloud Firestore, Node.js, Express, TypeScript, JWT, Bcrypt, Resend SDK, Express-Rate-Limit, CORS |
| **Testing & Calidad** | Vitest, React Testing Library, Supertest, Playwright (E2E), Oxlint, V8 Coverage |
| **Persistencia** | Cloud Firestore + Almacenamiento JSON con debounce + LocalStorage offline-first + Respaldo .JSON |
| **Gestor de Paquetes** | `pnpm` (Monorepo con workspaces) |

---

## 📁 Estructura del Proyecto

```
tracker-ing-sist/
├── backend/
│   ├── src/
│   │   ├── auth/             # Generación y verificación de tokens JWT y usuarios
│   │   ├── data/             # Catálogo oficial de materias troncales y electivas Plan 2023
│   │   ├── middleware/       # Limitador de peticiones (rate limiter) y autenticación
│   │   ├── routes/           # Endpoints de API (/api/plan, /api/progress, /api/auth, /api/mail/*)
│   │   ├── services/         # emailService.ts (Resend) y reminderService.ts (alertas automáticas 7 días)
│   │   ├── scripts/          # testEmail.ts (prueba directa de correos con Resend)
│   │   ├── storage/          # Persistencia en JSON (usuarios y progresos)
│   │   ├── test/             # 10 suites de pruebas unitarias e integración HTTP (Vitest + Supertest, 62 tests)
│   │   ├── types/            # Tipos TypeScript compartidos (incluye PerfilAlumno y MetaExamen)
│   │   └── server.ts         # Servidor Express
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts      # Configuración de pruebas y cobertura v8 para backend
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                 # Navegación, Header, BottomNav, MobileDrawer, ThemeSelector, Toast, ErrorBoundary
│   │   │   ├── views/                  # GridView, NetworkGraph, ElectivasDrawer, MobileElectivasView, NotFoundView
│   │   │   │   └── graph/              # Submódulos del grafo: GraphNodeInspector, GraphSearchBar, posiciones y estilos
│   │   │   ├── modals/                 # SubjectModal, CalendarModal, PrintableReportModal, ProfileModal, StatsModal, TitlesModal, etc.
│   │   │   │   └── calendar/           # Submódulos del calendario: CalendarMetasTab, CalendarTurnosTab, CalendarMonthGrid, ScheduleDialog
│   │   │   ├── ui/                     # Componentes base accesibles: Modal (FocusTrap), StatusBadge
│   │   │   └── index.ts                # Barrel export centralizado
│   │   ├── context/
│   │   │   ├── TrackerContext.tsx      # Lógica de correlativas, filtros, metas, notas y cálculo de promedios
│   │   │   ├── ThemeContext.tsx        # Gestión reactiva de los 5 temas visuales
│   │   │   ├── AuthContext.tsx         # Sesión híbrida (Firebase Auth / Backend JWT / Local)
│   │   │   └── UIContext.tsx           # Estado visual secundario y control de visibilidad de modales
│   │   ├── hooks/
│   │   │   ├── useFocusTrap.ts         # Atrapado de foco accesible para modales (WCAG)
│   │   │   ├── useHistoryBack.ts       # Navegación y cierre natural con botón atrás en móviles
│   │   │   ├── useKeyboardShortcuts.ts # Atajos rápidos de teclado globales (G, M, E, C, R, P, etc.)
│   │   │   └── useModalAnimation.ts    # Control fluido de animaciones de entrada y salida modal
│   │   ├── data/
│   │   │   ├── plan2023.ts             # Catálogo de 36 materias troncales y 19 electivas Plan 2023
│   │   │   ├── calendario/             # Módulo modular anual (turnos oficiales, feriados fijos/móviles e hitos)
│   │   │   ├── donations.ts            # Datos y configuración de donaciones (Mercado Pago)
│   │   │   └── driveLinks.ts           # Enlaces directos a carpetas comunitarias de apuntes y exámenes en Google Drive
│   │   ├── services/                   # Cliente API, Firebase, sanitización segura y merge inteligente
│   │   ├── utils/                      # pdfExporter.ts, backupManager.ts, academicCalculations.ts, cascadeEngine.ts, icsExporter.ts, share.ts
│   │   ├── test/                       # 28 suites unitarias e integración (Vitest + RTL + JSDOM, 216 tests)
│   │   ├── types/                      # Tipos re-exportados desde @tracker/types
│   │   ├── App.tsx                     # Componente raíz con layout y orquestación
│   │   └── index.css                   # Variables CSS semánticas, temas y Tailwind CSS v4
│   ├── package.json
│   └── vite.config.ts
├── packages/
│   └── types/                          # Paquete de tipos TypeScript canónicos (@tracker/types)
├── e2e/                                # 12 suites de pruebas End-to-End con Playwright (23 escenarios)
│   ├── malla.spec.ts                   # Malla curricular y alternancia interactiva
│   ├── subject-modal.spec.ts           # Modal de materia, actas, notas y metas
│   ├── calendario.spec.ts              # Navegación de meses y turnos oficiales de examen
│   ├── temas.spec.ts                   # Selector de temas y modo claro / oscuro
│   ├── electivas.spec.ts               # Drawer de electivas y acreditación de horas
│   ├── stats-titles.spec.ts            # Métricas, ADUSI e Ingeniería con horas PPS
│   ├── perfil-share.spec.ts            # Datos del alumno y enlaces compartibles
│   ├── mobile.spec.ts                  # Emulación móvil (Pixel 5), BottomNav y drawer táctil
│   ├── atajos-teclado.spec.ts          # Accesibilidad y atajos de teclado globales
│   ├── busqueda-filtros.spec.ts        # Búsqueda predictiva y filtros rápidos por nivel y estado
│   ├── not-found.spec.ts               # Pantalla de error 404 y recuperación de navegación
│   └── persistencia-backup.spec.ts     # Persistencia en localStorage tras reload y modal de ayuda
├── .github/
│   └── workflows/
│       └── ci-cd.yml                   # Pipeline unificado de CI/CD (lint, vitest, playwright, build, deploy)
├── docs/                               # Centro de Documentación Técnica (Diátaxis) y Cartillas
│   ├── README.md                       # Índice maestro de documentación técnica
│   ├── tutorials/                      # Guías de aprendizaje paso a paso (primeros pasos)
│   ├── how-to/                         # Recetas prácticas (materias, calendario, testing, deploy)
│   ├── reference/                      # Especificación técnica (modelo de datos, API, contextos)
│   ├── explanation/                    # Arquitectura, correlatividades en cascada y offline-first
│   ├── isi-a4-plan-2023-gradiente-utn-frro.pdf
│   ├── electivas-plan-2023.png
│   └── calendario-2026-2027-gradiente.pdf
├── firebase.json                       # Configuración de hosting y headers de caché
├── playwright.config.ts                # Configuración oficial de Playwright E2E
├── .oxlintrc.json                      # Reglas de linting de alto rendimiento
├── pnpm-workspace.yaml
├── package.json
├── GEMINI.md                           # Guía de contexto, arquitectura y comandos del monorepo
└── README.md
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js** v18 o superior (recomendado v20+)
- **pnpm** (o npm / yarn)

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/martin-ratti/tracker-ing-sist.git
   cd tracker-ing-sist
   ```

2. Instalar todas las dependencias del monorepo:
   ```bash
   pnpm install
   ```

### Ejecutar en Desarrollo

Para levantar el **Frontend** y el **Backend** en paralelo:

```bash
# Opción 1: Levantar frontend y backend juntos
pnpm dev

# Opción 2: Levantarlos por separado
pnpm dev:backend   # en una terminal (puerto 3001)
pnpm dev:frontend  # en otra terminal (puerto 5173)
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001/api/plan](http://localhost:3001/api/plan)

### Compilar y Desplegar para Producción

```bash
# Compilación completa del monorepo
pnpm build

# Compilar y desplegar automáticamente en Firebase Hosting
pnpm deploy
```

---

## 🧪 Testing Automatizado y Cobertura (~100%)

El monorepo cuenta con una suite integral y robusta de **301 pruebas continuas automatizadas** (100% aprobadas) que aseguran la fidelidad académica, la solidez matemática de las correlatividades, la protección contra vulnerabilidades de almacenamiento y la ausencia de regresiones en la interfaz:

- 🔬 **Tests Unitarios y de Integración (278 tests, 100% aprobados):**
  - **Backend (`tracker-backend`):** 62 tests en 10 suites con **99.05% de cobertura de líneas** en servicios centrales y 100% en rutas `/api/auth`, `/api/progress`, `/api/plan` y middlewares, ejecutados con `vitest` y `v8`. Valida seguridad JWT, hash bcrypt, middlewares de rate limit y autenticación, persistencia atómica en storage JSON, envío de emails transaccionales y endpoints REST con Supertest.
  - **Frontend (`frontend`):** 216 tests en 28 suites con **85.34% de líneas general y 100% en componentes centrales** (`App.tsx`, `plan2023.ts`, submódulos anuales de `calendario/`, datos de `donations.ts` y `driveLinks.ts`, primitivas UI, modales `TitlesModal`, `ShareModal`, `HelpModal`, `ThemeSelector`, `PrintableReportModal`, exportador vectorial `pdfExporter.ts`, gestor de respaldos `backupManager.ts`, utilitarios `icsExporter.ts`, `share.ts`, servicios de sanitización segura `api.ts` contra envenenamiento de almacenamiento CWE-502/CWE-79, y hooks de accesibilidad `useFocusTrap`, `useKeyboardShortcuts`, `useModalAnimation`). Ejecutados con `vitest`, React Testing Library y JSDOM. Cobertura completa sobre el motor de correlatividades, cascada, promedios, calendario de turnos oficiales de examen, diálogo interactivo de metas de examen, pantalla de error 404 y `ErrorBoundary` con respaldo de emergencia.

- 🎭 **Pruebas End-to-End con Playwright (23 escenarios, 100% aprobados):**
  - **Chromium Desktop (18 tests):** Validación completa en navegador de la Malla interactiva (`malla.spec.ts`), modal de materias, actas y metas (`subject-modal.spec.ts`), calendario académico 2026/2027 (`calendario.spec.ts`), los 5 temas visuales y modo oscuro (`temas.spec.ts`), horas de electivas (`electivas.spec.ts`), estadísticas y títulos ADUSI/Ingeniería (`stats-titles.spec.ts`), perfil de alumno y avance compartido (`perfil-share.spec.ts`), atajos de teclado globales (`atajos-teclado.spec.ts`), buscador predictivo y filtros rápidos (`busqueda-filtros.spec.ts`), página de error 404 (`not-found.spec.ts`) y persistencia en localStorage tras recarga (`persistencia-backup.spec.ts`).
  - **Mobile Chrome Pixel 5 (5 tests):** Emulación móvil (`mobile.spec.ts`) validando la barra inferior `BottomNav`, el menú lateral `MobileDrawer`, la alternancia táctil de materias en malla, la vista móvil de electivas y el acceso a titulación universitaria.

- ⚡ **Comandos de Test y Calidad:**

```bash
# Ejecutar linter Oxlint (0 warnings y 0 errores en 123 archivos)
pnpm lint

# Ejecutar todos los tests unitarios y de integración (Backend + Frontend, 278 tests)
pnpm test

# Ejecutar y generar reporte de cobertura consolidada V8 en terminal
pnpm test:coverage

# Ejecutar la suite completa de pruebas End-to-End con Playwright (23 tests: Desktop + Mobile)
pnpm test:e2e
```

---

## 🔄 Integración y Despliegue Continuo (CI/CD Pipeline)

El proyecto cuenta con un pipeline automatizado en **GitHub Actions** ([`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml)) que garantiza la máxima confiabilidad ante cada `push` o `pull_request`:

1. **4 Jobs Paralelos de Verificación:**
   - **`lint`:** Análisis estático ultrarrápido con `oxlint` (política de 0 warnings en 123 archivos).
   - **`test-unit`:** Ejecución de los 278 tests de Vitest (backend y frontend) con generación y subida de artefactos de cobertura V8.
   - **`test-e2e`:** Ejecución de los 23 tests de Playwright sobre Chromium Desktop y Mobile Chrome emulado.
   - **`build`:** Compilación de tipos (`@tracker/types`), backend (`tsc`) y frontend con Vite 8 y Rolldown.
2. **Despliegue Continuo (CD) a Producción:**
   - Ante cada `push` a la rama `main`, y tras la aprobación de los 4 jobs previos, se despliega automáticamente a **Firebase Hosting** ([utn-sistemas-frro.web.app](https://utn-sistemas-frro.web.app)) mediante `FirebaseExtended/action-hosting-deploy`.
   - En Pull Requests, genera automáticamente un canal de previsualización efímero (*Preview Channel*).

---

## 📚 Documentación del Proyecto

El repositorio cuenta con una suite completa de documentación técnica estructurada bajo el marco **[Diátaxis](https://diataxis.fr/)** en la carpeta [`docs/`](./docs):
- 📘 [**Centro de Documentación Técnica (`docs/README.md`)**](./docs/README.md): Índice maestro con mapa de navegación entre tutoriales, guías prácticas, referencias de código y arquitectura.
  - 🎓 [**Primeros Pasos**](./docs/tutorials/primeros-pasos.md): Guía de instalación, entorno de desarrollo y primera contribución.
  - 🛠️ [**Guías Prácticas (How-To)**](./docs/how-to/): Agregar materias y electivas, actualizar calendarios, testing y despliegue a Firebase.
  - 📖 [**Referencia Técnica**](./docs/reference/): Modelo de datos TypeScript, especificación API REST, contextos de React y monorepo.
  - 💡 [**Explicaciones de Arquitectura**](./docs/explanation/): Motor de correlatividades y cascada, persistencia offline-first y diseño visual WCAG 2.2 AA.

### 🏛️ Cartillas y Material Oficial UTN FRRo
- 📄 [**Plan 2023 Gradiente UTN FRRo (PDF)**](./docs/isi-a4-plan-2023-gradiente-utn-frro.pdf): Cartilla A4 con las 36 materias troncales, Seminario Integrador ADUSI y correlatividades oficiales.
- 🖼️ [**Grilla Oficial de Asignaturas Electivas Plan 2023**](./docs/electivas-plan-2023.png): Tabla de materias electivas organizadas por nivel, tipo de dictado y horas anuales.
- 📅 [**Calendario Académico Oficial 2026-2027 (PDF)**](./docs/calendario-2026-2027-gradiente.pdf): Fechas de mesas de examen, recesos e inscripciones.

---

## 💙 Apoyo al Proyecto y Donaciones

El **Tracker UTN Sistemas** es un desarrollo de código abierto libre y gratuito para toda la comunidad académica de Ingeniería en Sistemas de Información.

Si la herramienta te resulta de utilidad para organizar tu cursada, correlatividades y exámenes finales, podés colaborar voluntariamente con su mantenimiento:

| Medio | Datos |
| :--- | :--- |
| **Plataforma** | **Mercado Pago** |
| **Alias** | `epi321` |
| **Titular** | Martín Ratti |

¡Cualquier colaboración de la comunidad es enormemente agradecida y ayuda a mantener el proyecto activo, actualizado y libre de anuncios invasivos!

---

## 📜 Licencia y Créditos

- Desarrollado por **Martín Ratti**.
- Inspirado en la idea original de [Lucas Alonso](https://github.com/lucasalonso05/tracker-plan-de-estudio).
- Datos y correlatividades basados en la ordenanza oficial del **Plan 2023 de Ingeniería en Sistemas de Información (UTN FRRo)**.
