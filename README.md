# Tracker UTN Sistemas · Plan 2023 (FRRo) 🚀

Plataforma web interactiva para el seguimiento del plan de estudio de **Ingeniería en Sistemas de Información (Plan 2023 - UTN Facultad Regional Rosario)**. Permite gestionar correlatividades en tiempo real, visualizar el árbol de dependencias, registrar finales y notas, y monitorear el progreso hacia los títulos de **ADUSI** e **Ingeniería**.

Inspirado en el diseño original de [Tracker Plan de Estudio](https://tracker-plan-de-estudio.vercel.app/index.html) por Lucas Alonso, reescrito con arquitectura moderna: **React 19 + TypeScript** en el frontend y **Node.js + Express** en el backend.

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
  - Controles táctiles y en pantalla: Zoom in/out, ajustar y centrar pantalla, y paneo fluido.

- 📋 **Vista Dual: Grafo de Red / Malla Curricular con Filtros Rápidos:**
  - Alterná con un clic entre el grafo de relaciones y una cuadrícula interactiva estilo cartilla física organizada por niveles (1º a 5º año).
  - **Filtros Rápidos Tipo Chip:** *Todas*, *Cursables*, *Regulares*, *Aprobadas* y *Con Meta 🎯* con contadores en vivo.
  - Buscador predictivo por nombre o código de materia.
  - Barras de progreso de avance porcentual individuales por nivel académico.
  - Badges contextuales de metas agendadas con cuenta regresiva en días.

- 📅 **Agenda de Mesas de Finales & Metas Tentativas (Calendario 2026-2027):**
  - Integración del Calendario Académico Oficial de UTN FRRo (`docs/calendario-2026-2027-gradiente.pdf`).
  - Selección de turno de examen (16 turnos oficiales entre Feb 2026 y Mar 2027) para cualquier materia regular.
  - Cuenta regresiva automática en días ("Faltan 12 días", "¡Es hoy!").
  - Modal del Calendario Académico (`CalendarModal.tsx`) con pestañas para "Mis Metas Activas", lista cronológica de turnos y directivas de Sysacad (cierre 18:00 hs del penúltimo día hábil).

- 📄 **Exportar a PDF / Analítico Imprimible Oficial:**
  - Ficha formal con membrete oficial de UTN Facultad Regional Rosario.
  - Identificación del estudiante (Nombre y Legajo universitario).
  - Métricas completas: promedios (con y sin aplazos), avance ADUSI / Ingeniería, horas de electivas y PPS.
  - Grilla analítica por nivel académico con códigos de asignatura, notas, libros, folios y fechas.
  - Optimizado para impresión directa o guardado en formato PDF estándar A4 sin barras ni botones superfluos.

- 👤 **Perfil Universitario del Alumno:**
  - Modal interactivo para configurar Nombre y Legajo estudiantil (`ProfileModal.tsx`).
  - Persistencia automática tanto en local como en la nube.
  - Avatar de iniciales en la barra superior.

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

- ☁️ **Sincronización en la Nube con Cuentas de Usuario:**
  - Registro e inicio de sesión con correo y contraseña cifrada con `bcrypt`.
  - Tokens JWT de sesión con persistencia multi-dispositivo (PC, celular, tablet).
  - Protección de seguridad en el backend con limitador de tasa (*Rate Limiter*).
  - **Modo Local Offline Híbrido:** Si preferís no registrarte, podés usar el tracker al 100% en local mediante `localStorage`.

- 🛡️ **Validación Estricta y Reseteo en Cascada:**
  - No permite marcar estados inválidos si faltan correlativas. Muestra alertas contextuales (*Toast*) indicando con precisión qué materias faltan regularizar o aprobar.
  - **Seminario Integrador ADUSI:** Validación oficial que exige tener aprobadas las 23 materias de 1º, 2º y 3º año para poder asentarlo como aprobado.
  - Si una materia correlativa vuelve a "Pendiente", el sistema recalcula en cascada e invalida de forma recursiva todas las materias dependientes para garantizar consistencia académica.

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

- 📝 **Libreta de Exámenes y Promedios:**
  - Formulario completo para registrar calificación (1 a 10), fecha de examen, libro, folio y anotaciones sobre la cátedra.
  - Cálculo automático del promedio general (con y sin aplazos).

- ♿ **Accesibilidad WCAG 2.2:**
  - Soporte completo de navegación por teclado (`Escape` para cerrar, `Enter` / `Espacio` para interactuar, `Tab` con foco atrapado en modales `useFocusTrap`).
  - Etiquetas ARIA y diálogos accesibles.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8 (Rolldown), Tailwind CSS v4, Vis-Network, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, JWT, Bcrypt, Express-Rate-Limit, CORS, TSX |
| **Linter & Tooling** | `oxlint` (Oxc Compiler Stack de ultra alto rendimiento) |
| **Persistencia** | Almacenamiento JSON con debounce (cuentas y progreso) + LocalStorage offline |
| **Gestor de Paquetes** | `pnpm` (Monorepo con workspaces) |

---

## 📁 Estructura del Proyecto

```
tracker-ing-sist/
├── backend/
│   ├── src/
│   │   ├── auth/             # Generación y verificación de tokens JWT
│   │   ├── data/             # Catálogo oficial de materias troncales y electivas Plan 2023
│   │   ├── middleware/       # Limitador de peticiones (rate limiter) y autenticación
│   │   ├── routes/           # Endpoints de API (/api/plan, /api/progress, /api/auth)
│   │   ├── storage/          # Persistencia en JSON (usuarios y progresos)
│   │   ├── types/            # Tipos TypeScript compartidos (incluye PerfilAlumno y MetaExamen)
│   │   └── server.ts         # Servidor Express
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                 # Navegación, Header, BottomNav, ThemeSelector, Toast
│   │   │   ├── views/                  # Vistas principales: GridView, NetworkGraph, ElectivasDrawer
│   │   │   ├── modals/                 # Diálogos modales: Subject, Calendar, Profile, Stats, etc.
│   │   │   ├── ui/                     # Componentes base: Modal accesible, StatusBadge
│   │   │   └── index.ts                # Barrel export centralizado
│   │   ├── context/
│   │   │   ├── TrackerContext.tsx      # Lógica de correlativas, filtros, metas y perfil
│   │   │   ├── ThemeContext.tsx        # Gestión de los 5 temas visuales
│   │   │   └── AuthContext.tsx         # Sesión de usuario y sincronización remota
│   │   ├── hooks/
│   │   │   ├── useFocusTrap.ts         # Atrapado de foco accesible para modales (WCAG)
│   │   │   └── useKeyboardShortcuts.ts # Atajos rápidos de teclado (G, M, E, C, etc.)
│   │   ├── data/
│   │   │   ├── plan2023.ts             # Catálogo local de materias y electivas Plan 2023
│   │   │   └── calendario2026.ts       # Calendario oficial 2026-2027 y fechas de exámenes UTN
│   │   ├── services/                   # Cliente API, Firebase y algoritmo de merge inteligente
│   │   ├── types/                      # Tipos de TypeScript compartidos
│   │   ├── App.tsx
│   │   └── index.css                   # Variables CSS semánticas y Tailwind CSS v4
│   ├── package.json
│   └── vite.config.ts
├── docs/                               # Documentación y cartillas oficiales de UTN FRRo
│   ├── isi-a4-plan-2023-gradiente-utn-frro.pdf
│   ├── electivas-plan-2023.png
│   └── calendario-2026-2027-gradiente.pdf
├── firebase.json                       # Configuración de hosting y headers de caché
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
npm run deploy
```

---

## 📚 Documentación Oficial Incluida

En la carpeta [`docs/`](./docs) se encuentran digitalizados los documentos oficiales de referencia:
- 📄 [**Plan 2023 Gradiente UTN FRRo (PDF)**](./docs/isi-a4-plan-2023-gradiente-utn-frro.pdf): Cartilla A4 con las 36 materias troncales, Seminario Integrador ADUSI y correlatividades oficiales.
- 🖼️ [**Grilla Oficial de Asignaturas Electivas Plan 2023**](./docs/electivas-plan-2023.png): Tabla de materias electivas organizadas por nivel, tipo de dictado y horas anuales.
- 📅 [**Calendario Académico Oficial 2026-2027 (PDF)**](./docs/calendario-2026-2027-gradiente.pdf): Fechas de mesas de examen, recesos e inscripciones.

---

## 📜 Licencia y Créditos

- Desarrollado por **Martín Ratti**.
- Inspirado en la idea original de [Lucas Alonso](https://github.com/lucasalonso05/tracker-plan-de-estudio).
- Datos y correlatividades basados en la ordenanza oficial del **Plan 2023 de Ingeniería en Sistemas de Información (UTN FRRo)**.
