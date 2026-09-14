# Estado del Proyecto: Tracker Plan de Estudio UTN Sistemas (Plan 2023 · FRRo)

**Fecha de actualización:** 14 de Septiembre de 2026  
**Repositorio GitHub:** [https://github.com/martin-ratti/tracker-ing-sist.git](https://github.com/martin-ratti/tracker-ing-sist.git)  
**Inspiración:** [Tracker Plan de Estudio](https://tracker-plan-de-estudio.vercel.app/index.html) de Lucas Alonso

---

## 1. Resumen y Objetivos

Este proyecto es una aplicación web moderna concebida para el seguimiento interactivo del plan de estudio de **Ingeniería en Sistemas de Información (Plan 2023 - UTN Facultad Regional Rosario)**. Permite a los alumnos gestionar su avance de carrera, validar en tiempo real correlatividades académicas para cursado y finales, calcular promedios, simular escenarios académicos y monitorear los requisitos para ambos títulos:
- **Título Intermedio:** Analista Desarrollador Universitario en Sistemas de Información (ADUSI).
- **Título de Grado:** Ingeniero/a en Sistemas de Información.

---

## 2. Lo que se ha Implementado y Completado

###  Base de Datos y Modelado Académico Oficial (Plan 2023)
- **36 Materias Troncales + Seminario Integrador ADUSI:**
  - Extraídas directamente de la cartilla oficial de UTN FRRo (`isi-a4-plan-2023-gradiente-utn-frro.pdf`).
  - Correlatividades exactas de cursado (regulares y aprobadas) y de final.
  - Inclusión del *Seminario Integrador (ADUSI)* de 3º nivel (id 99).
  - Reglas actualizadas para *Proyecto Final*: para cursar requiere regulares 25, 26, 30 y aprobadas 12, 20, 23; para rendir exige todas las materias restantes aprobadas.
- **19 Materias Electivas Oficiales:**
  - Sincronizadas según la grilla oficial de Asignaturas Electivas Plan 2023.
  - Incorporación de *Programación Competitiva* (Nivel 2, Anual, 4 hs), *Química Aplicada a la Informática* (Nivel 3, Cuatrimestral, 3 hs), *Entornos Gráficos*, *Sistemas de Información Geográfica*, *Algoritmos Genéticos*, etc.
  - Regla oficial: computación directa de horas reales según grilla (meta 20 hs para Ingeniería y 4 hs para ADUSI).

###  Backend en Node.js + Express + TypeScript
- **Arquitectura modular:**
  - `src/types/plan.ts`: Tipos estrictos para materias, electivas, estados y notas.
  - `src/data/plan2023.ts`: Fuente de datos estática oficial del plan 2023.
  - `src/storage/progressStore.ts`: Almacenamiento persistente en JSON (`data/progress.json`) con debounce para escrituras concurrentes.
  - `src/routes/api.ts`: Endpoints REST:
    - `GET /api/plan`: devuelve la estructura completa de materias, electivas y requisitos de titulación.
    - `GET /api/progress`: obtiene el progreso actual del alumno.
    - `POST /api/progress`: guarda y sincroniza el estado de materias, electivas, notas y horas de PPS.
    - `POST /api/progress/reset`: resetea el progreso a estado inicial.
    - `GET /api/health`: chequeo de disponibilidad.
  - `src/server.ts`: Servidor Express configurado con CORS y proxy habilitado.

###  Frontend en React 19 + Vite + Tailwind CSS v4 + TypeScript
- **Estética Cyberpunk / Dark Tech Premium:**
  - Tipografías profesionales: *IBM Plex Mono* para datos técnicos y *Syne* para títulos destacados.
  - Animaciones de pulso neón y sombras dinámicas según estado de la materia.
- **Visualizador de Grafo Interactivo (`NetworkGraph.tsx`):**
  - Implementado con `vis-network` standalone optimizado sin sobrecarga de física.
  - Disposición jerárquica vertical (1º a 5º año).
  - Colores reactivos por estado:
    - ⚪ **Pendiente / Bloqueada:** Azul noche (#0d1527) con borde tenue.
    - 🟡 **Regular:** Ámbar (#f59e0b) con brillo dorado.
    - 🟢 **Aprobada:** Verde esmeralda (#10b981) con glow de logro.
    - 🔵 **Cursable (Habilitada):** Cian brillante (#22d3ee) con efecto de pulso pulsante continuo.
  - Filtro de conexiones de árbol: Ver todas / Solo para cursar (regulares) / Solo para rendir (aprobadas).
  - Controles en pantalla: Zoom In, Zoom Out, Ajustar y Centrar pantalla.
- **Vista Dual: Malla Curricular en Cuadrícula (`GridView.tsx`):**
  - Alternador fluido entre el grafo de red y una vista estilo cartilla universitaria.
  - 5 columnas organizadas por año (1º a 5º nivel) con barra de avance individual por nivel.
  - Tarjetas interactivas con badges (`INT`, `1C/2C`, `ADUSI`, `Horas`).
  - Buscador en tiempo real por nombre o código de materia.
- **Motor de Validación y Reseteo en Cascada (`TrackerContext.tsx`):**
  - Valida antes de permitir cualquier cambio de estado si el alumno cumple con todas las correlatividades exigidas.
  - Si no las cumple, muestra un Toast flotante indicando exactamente qué materias faltan regularizar o aprobar.
  - Reseteo en cascada automático: si se desmarca una materia correlativa base (ej. *Álgebra* o *Algoritmos*), recalcula recursivamente e invalida todas las materias subsiguientes que hayan quedado sin sustento académico.
- **Panel Lateral de Electivas (`ElectivasDrawer.tsx`):**
  - Barra de progreso de horas hacia la meta de 20 hs de Ingeniería y 4 hs de ADUSI.
  - Filtro por nivel (2º, 3º, 4º, 5º año).
  - Validación de correlativas para electivas.
- **Modal de Detalle de Materia y Libreta de Calificaciones (`SubjectModal.tsx`):**
  - Consulta de correlativas requeridas y verificación con checkmarks.
  - Visualización de materias que ayuda a destrabar a futuro.
  - Formulario de examen final: registro de calificación (1 a 10), fecha de mesa, libro, folio y notas sobre la cátedra/profesor.
  - Cálculo automático de promedio de la carrera (con aplazos y sin aplazos).
- **Modal de Titulación Dual (`TitlesModal.tsx`):**
  - Seguimiento del título intermedio ADUSI con checklist y porcentaje.
  - Seguimiento del título de Ingeniero/a con medidor de materias, horas de electivas y barra deslizante para las 200 hs de Prácticas Profesionales Supervisadas (PPS).
- **Persistencia Híbrida (`api.ts`):**
  - Guarda en `localStorage` al instante (cero latencia, funciona 100% offline).
  - Sincroniza en segundo plano con la API de Node.js con estrategia de debounce.

---

## 3. Estado de Compilación y Verificación

- `backend`: Compila con `tsc` sin ningún error (`exit code 0`).
- `frontend`: Compila con `tsc -b && vite build` sin ningún error (`exit code 0`).
- Estructura de workspaces configurada con `pnpm-workspace.yaml` y script orquestador en la raíz.

---

## 4. Qué Falta Hacer (Pendientes y Próximos Pasos)

1. **Subir cambios iniciales a GitHub:**
   - Realizar el `git add`, `git commit` inicial y hacer el primer push al repositorio remoto `https://github.com/martin-ratti/tracker-ing-sist.git`.
2. **Exportación e Importación de Progreso:**
   - Botón para exportar el avance académico del alumno en un archivo `.json` de respaldo.
   - Opción para importar un respaldo JSON o compartir el plan con compañeros.
   - Opción de exportar resumen a PDF / imagen imprimible para presentar en la facu.
3. **Autenticación Multiusuario (Opcional):**
   - Actualmente el backend almacena el progreso de forma persistente y el frontend tiene soporte multi-sesión con localStorage. Si se desea soporte multi-alumno en la nube, se puede integrar Supabase Auth o JWT con SQLite / PostgreSQL.
4. **PWA (Progressive Web App):**
   - Configurar `vite-plugin-pwa` para poder instalar el tracker en el celular o escritorio como app nativa sin barra de navegación.
5. **Simulador de Inscripción Cuatrimestral:**
   - Permitir al alumno seleccionar qué materias planea cursar el próximo cuatrimestre para verificar carga horaria semanal total y que no se superpongan días/requisitos.
