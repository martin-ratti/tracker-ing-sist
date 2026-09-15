# Tracker UTN Sistemas · Plan 2023 (FRRo) 🚀

Plataforma web interactiva para el seguimiento del plan de estudio de **Ingeniería en Sistemas de Información (Plan 2023 - UTN Facultad Regional Rosario)**. Permite gestionar correlatividades en tiempo real, visualizar el árbol de dependencias, registrar finales y notas, y monitorear el progreso hacia los títulos de **ADUSI** e **Ingeniería**.

Inspirado en el diseño original de [Tracker Plan de Estudio](https://tracker-plan-de-estudio.vercel.app/index.html) por Lucas Alonso, reescrito con arquitectura moderna: **React 19 + TypeScript** en el frontend y **Node.js + Express** en el backend.

---

## ⚡ Características Principales

- 🌐 **Grafo Interactivo de Correlativas:**
  - Visualizador de red jerárquico por niveles utilizando `vis-network`.
  - Estados reactivos:
    - ⚪ **Pendiente / Bloqueada:** Sin requisitos cumplidos.
    - 🔵 **Cursable (Brillante con Pulso):** Cumple con las materias regulares y aprobadas exigidas para iniciar el cursado.
    - 🟡 **Regular:** Cursada aprobada, lista para rendir examen final.
    - 🟢 **Aprobada:** Final o promoción acreditada.
  - Filtro dinámico de aristas: *Todas*, *Solo para Cursar* (regulares) y *Solo para Rendir* (aprobadas).
  - Controles táctiles y en pantalla: Zoom in/out, fit de pantalla y drag fluido.

- 📋 **Vista Dual: Grafo / Malla Curricular:**
  - Alterná con un clic entre el grafo de red y una cuadrícula estilo cartilla física organizada por niveles (1º a 5º año).
  - Buscador predictivo por nombre o código de materia.
  - Barras de progreso individuales por nivel académico.

- 🛡️ **Validación Estricta y Reseteo en Cascada:**
  - No permite marcar estados inválidos si faltan correlativas. Muestra alertas contextuales (*Toast*) indicando con precisión qué materias faltan regularizar o aprobar.
  - Si una materia correlativa vuelve a "Pendiente", el sistema recalcula en cascada e invalida de forma recursiva todas las materias dependientes para evitar inconsistencias académicas.

- 🎓 **Seguimiento de Doble Titulación:**
  - **ADUSI (Analista Desarrollador Universitario en Sistemas de Información):**
    - 1º, 2º y 3º año completos (23 materias) + Seminario Integrador + 4 hs de electivas.
  - **Ingeniería en Sistemas de Información:**
    - 36 materias troncales + 20 hs de electivas + 200 hs de Prácticas Profesionales Supervisadas (PPS).
    - Barra interactiva para cargar las horas de PPS realizadas.

- ✨ **Panel Inteligente de Electivas:**
  - Catálogo completo con las 19 materias electivas oficiales del Plan 2023.
  - Cómputo directo de horas reales según normativa de UTN FRRo.
  - Indicador de cumplimiento para la meta de 4 hs (ADUSI) y 20 hs (Ingeniería).

- 📝 **Libreta de Exámenes y Promedios:**
  - Doble clic en cualquier materia para registrar calificación numérica, fecha de examen, libro, folio y anotaciones sobre la cátedra.
  - Cálculo automático del promedio general (con y sin aplazos).

- 💾 **Persistencia Híbrida:**
  - Guardado instantáneo en `localStorage` (cero latencia, funciona 100% offline).
  - Sincronización automática en segundo plano con el backend en Node.js.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Vis-Network, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, CORS, Dotenv, TSX |
| **Persistencia** | Almacenamiento JSON persistente con debounce + LocalStorage offline |
| **Gestor de Paquetes** | `pnpm` (Monorepo con workspaces) |

---

## 📁 Estructura del Proyecto

```
tracker-ing-sist/
├── backend/
│   ├── src/
│   │   ├── data/             # Materias troncales y electivas Plan 2023 FRRo
│   │   ├── routes/           # Endpoints de la API (/api/plan, /api/progress)
│   │   ├── storage/          # Persistencia en data/progress.json
│   │   ├── types/            # Tipos de datos en TypeScript
│   │   └── server.ts         # Servidor Express
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx           # Barra superior con estadísticas en vivo
│   │   │   ├── NetworkGraph.tsx     # Grafo interactivo con vis-network
│   │   │   ├── GridView.tsx         # Vista de malla curricular por niveles
│   │   │   ├── ElectivasDrawer.tsx  # Panel lateral de electivas
│   │   │   ├── SubjectModal.tsx     # Modal de correlativas y notas de finales
│   │   │   ├── TitlesModal.tsx      # Medidor de títulos ADUSI e Ingeniería
│   │   │   ├── HelpModal.tsx        # Guía interactiva de uso
│   │   │   └── Toast.tsx            # Alertas flotantes
│   │   ├── context/                 # TrackerContext con la lógica de correlativas
│   │   ├── data/                    # Catálogo local de materias y electivas
│   │   ├── services/                # Cliente API para conectar con backend
│   │   ├── types/                   # Tipos de TypeScript compartidos
│   │   ├── App.tsx
│   │   └── index.css                # Estilos globales y efectos de pulso neón
│   ├── package.json
│   └── vite.config.ts
├── ESTADO_DEL_PROYECTO.md    # Bitácora de implementación y roadmap
├── pnpm-workspace.yaml
├── package.json
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
pnpm dev:backend   # en una terminal (puerto 3001)
pnpm dev:frontend  # en otra terminal (puerto 5173)
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001/api/plan](http://localhost:3001/api/plan)

### Compilar para Producción

```bash
pnpm build
```

Ambos módulos (`dist` en backend y frontend) se generarán listos para desplegar en cualquier plataforma (Vercel, Render, Railway, etc.).

---

## 📚 Documentación Oficial Incluida

En la carpeta [`docs/`](./docs) se encuentran digitalizados los documentos oficiales de referencia:
- 📄 [**Plan 2023 Gradiente UTN FRRo (PDF)**](./docs/isi-a4-plan-2023-gradiente-utn-frro.pdf): Cartilla A4 con las 36 materias troncales, Seminario Integrador ADUSI y correlatividades oficiales.
- 🖼️ [**Grilla Oficial de Asignaturas Electivas Plan 2023**](./docs/electivas-plan-2023.png): Tabla de materias electivas organizadas por nivel, tipo de dictado y horas anuales.

---

## 📜 Licencia y Créditos

- Desarrollado por **Martín Ratti**.
- Inspirado en la idea original de [Lucas Alonso](https://github.com/lucasalonso05/tracker-plan-de-estudio).
- Datos y correlatividades basados en la ordenanza oficial del **Plan 2023 de Ingeniería en Sistemas de Información (UTN FRRo)**.
