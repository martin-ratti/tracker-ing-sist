# Estado del Proyecto: Tracker Plan de Estudio UTN Sistemas (Plan 2023 · FRRo)

**Fecha de actualización:** 15 de Septiembre de 2026  
**Repositorio GitHub:** [https://github.com/martin-ratti/tracker-ing-sist.git](https://github.com/martin-ratti/tracker-ing-sist.git)  
**Inspiración:** [Tracker Plan de Estudio](https://tracker-plan-de-estudio.vercel.app/index.html) de Lucas Alonso

---

## 1. Resumen y Objetivos

Este proyecto es una aplicación web moderna concebida para el seguimiento interactivo del plan de estudio de **Ingeniería en Sistemas de Información (Plan 2023 - UTN Facultad Regional Rosario)**. Permite a los alumnos gestionar su avance de carrera, validar en tiempo real correlatividades académicas para cursado y finales, calcular promedios, simular escenarios académicos, guardar datos en la nube con cuenta personal y monitorear los requisitos para ambos títulos:
- **Título Intermedio:** Analista Desarrollador Universitario en Sistemas de Información (ADUSI).
- **Título de Grado:** Ingeniero/a en Sistemas de Información.

---

## 2. Lo que se ha Implementado y Completado

### 📚 Base de Datos y Modelado Académico Oficial (Plan 2023)
- **36 Materias Troncales + Seminario Integrador ADUSI:**
  - Extraídas directamente de la cartilla oficial de UTN FRRo (`docs/isi-a4-plan-2023-gradiente-utn-frro.pdf`).
  - Correlatividades exactas de cursado (regulares y aprobadas) y de final.
  - Inclusión del *Seminario Integrador (ADUSI)* de 3º nivel (id 99) en el panel de electivas/título intermedio.
  - **Validación Estricta de Final para Seminario:** Exige tener aprobadas la totalidad de las 23 materias de 1º, 2º y 3º año para poder pasarlo a estado "Aprobada", respetando la ordenanza de título intermedio.
  - **Corrección de Correlatividades Oficiales:** Ajustada la materia electiva *Metodologías Ágiles en el Desarrollo de Software* (id 215), eliminando la exigencia errónea de Ingeniería de Calidad (id 25).
  - Reglas actualizadas para *Proyecto Final*: para cursar requiere regulares 25, 26, 30 y aprobadas 12, 20, 23; para rendir exige todas las materias restantes aprobadas.
- **19 Materias Electivas Oficiales:**
  - Sincronizadas según la grilla oficial de Asignaturas Electivas Plan 2023 (`docs/electivas-plan-2023.png`).
  - Incorporación de *Programación Competitiva* (Nivel 2, Anual, 4 hs), *Química Aplicada a la Informática* (Nivel 3, Cuatrimestral, 3 hs), *Entornos Gráficos*, *Sistemas de Información Geográfica*, *Algoritmos Genéticos*, etc.
  - Cómputo directo de horas reales según normativa de UTN FRRo (meta 20 hs para Ingeniería y 4 hs para ADUSI).

### 🔒 Autenticación y Sincronización en la Nube
- **Cuentas de Alumno en la Nube:**
  - Registro e inicio de sesión seguro con correo electrónico y contraseña.
  - Cifrado unidireccional de contraseñas con algoritmo `bcrypt` (10 salt rounds).
  - Emisión de tokens de sesión **JWT (JSON Web Tokens)** con expiración configurable.
  - Almacenamiento independiente del progreso de cada usuario en `backend/data/users.json` y `backend/data/progress_users.json`.
  - **Protección de Rutas (Rate Limiter):** Middleware de limitación de tasa contra ataques de fuerza bruta en endpoints `/api/auth/*`.
  - **Modo Híbrido Flexible:** Los alumnos pueden usar la app 100% offline en local sin registrarse (usando `localStorage`), o iniciar sesión en cualquier momento para sincronizar y acceder a sus datos desde cualquier PC o celular.

### 🎨 Sistema de 5 Temas Visuales Dinámicos
- Selector interactivo en el Header (`ThemeSelector.tsx`) con 5 estilos visuales:
  1. **Cyber Blueprint (Cian Tech):** Azul noche con cian neón, ámbar y esmeralda.
  2. **Neon Synthwave (Rosa / Fucsia):** Púrpura oscuro con rosa vibrante, violeta y turquesa.
  3. **Emerald Matrix (Verde Hacker):** Verde profundo terminal con lima y menta.
  4. **Amber Sunset (Solar):** Tonos cálidos tierra con ámbar, naranja fuego y esmeralda.
  5. **Nordic Frost (Azul Glacial):** Azul nórdico con celeste polar, índigo y turquesa.
- **Arquitectura Cromática Desacoplada:** Variables semánticas globales en CSS (`--color-primary`, `--color-cursable`, `--color-regular`, `--color-aprobada`, `--gradient-primary`, etc.) que sincronizan al 100% el grafo de Vis Network, la malla curricular, los modales, drawers, botones, badges y la leyenda informativa.

### ⚙️ Backend en Node.js + Express + TypeScript
- **Arquitectura modular y escalable:**
  - `src/types/plan.ts`: Tipos estrictos para materias, electivas, estados, notas y usuarios.
  - `src/data/plan2023.ts`: Fuente de datos estática oficial del plan 2023.
  - `src/storage/progressStore.ts`: Almacenamiento persistente con soporte para invitados y usuarios autenticados.
  - `src/storage/userStore.ts`: Gestión de usuarios y credenciales.
  - `src/auth/jwt.ts`: Generación y verificación de tokens JWT.
  - `src/middleware/rateLimiter.ts`: Limitador de peticiones por IP.
  - `src/routes/auth.ts`: Endpoints `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
  - `src/routes/api.ts`: Endpoints `/api/plan`, `/api/progress`, `/api/progress/reset`, `/api/health`.
  - `src/server.ts`: Servidor Express configurado con CORS, parsing JSON y middleware de logging.

### 💻 Frontend en React 19 + Vite 8 + Tailwind CSS v4 + TypeScript
- **Grafo Interactivo de Red (`NetworkGraph.tsx`):**
  - Implementado con `vis-network` standalone optimizado sin sobrecarga de física.
  - Disposición jerárquica vertical (1º a 5º año) con colores reactivos al tema.
  - Filtro de conexiones de árbol: Ver todas / Solo para cursar / Solo para rendir.
  - Controles flotantes: Zoom In, Zoom Out, Ajustar y Centrar pantalla.
- **Vista de Malla Curricular (`GridView.tsx`):**
  - Alternador fluido entre el grafo y una cartilla organizada en 5 columnas por año.
  - Barras de progreso individuales por nivel académico.
  - Tarjetas interactivas con badges (`INT`, `1C/2C`, `ADUSI`, `Horas`).
  - Buscador predictivo en tiempo real por nombre o código de materia.
- **Motor de Validación y Reseteo en Cascada (`TrackerContext.tsx`):**
  - Validación de requisitos previos antes de permitir regularizar o aprobar materias.
  - Toasts contextuales con el detalle exacto de las correlativas faltantes.
  - Reseteo en cascada recursivo al desmarcar cualquier materia correlativa base.
- **Panel Lateral de Electivas (`ElectivasDrawer.tsx`):**
  - Medidor de horas hacia las metas de 20 hs (Ingeniería) y 4 hs (ADUSI).
  - Filtro por nivel (2º a 5º año) y tarjeta destacada del Seminario ADUSI.
- **Libreta de Calificaciones (`SubjectModal.tsx`):**
  - Formulario de examen final: nota (1 a 10), fecha de mesa, libro, folio y notas de cátedra.
  - Cálculo automático en vivo de promedios general y sin aplazos.
- **Medidor de Titulación Dual (`TitlesModal.tsx`):**
  - Checklist y porcentaje hacia el título de ADUSI e Ingeniería.
  - Control interactivo para registrar las 200 hs de Prácticas Profesionales Supervisadas (PPS).
- **Accesibilidad WCAG 2.2:**
  - Trampas de foco (`useFocusTrap`) en todos los modales.
  - Navegación completa por teclado (Escape, Enter, Espacio, Tab).
  - Atributos semánticos ARIA (`role="dialog"`, `aria-modal="true"`, `role="region"`, `role="search"`).

---

## 3. Estado de Compilación, Calidad y Verificación

- `backend`: Compila con `tsc` sin ningún error (`exit code 0`).
- `frontend`: Compila con `tsc -b && vite build` (Vite 8 + Rolldown) en 2.62s sin ningún error (`exit code 0`).
- `linter`: Validado con **`oxlint`** sobre los 29 archivos del monorepo con 0 errores.
- Monorepo gestionado limpiamente con `pnpm-workspace.yaml`.
- Todos los commits siguen la especificación de **Conventional Commits** y se encuentran sincronizados en la rama `main` de GitHub.

---

## 4. Próximos Pasos y Roadmap Futuro

1. **Exportación e Importación Local de Respaldo:**
   - Botón para descargar el avance en archivo `.json`.
   - Opción para importar un archivo `.json` de respaldo sin requerir cuenta.
2. **Exportación a Formato Imprimible / PDF:**
   - Generación de informe académico en PDF o imagen para imprimir la cartilla con los estados coloreados.
3. **PWA (Progressive Web App):**
   - Configuración de `vite-plugin-pwa` con Service Worker para instalación como app nativa en dispositivos móviles y funcionamiento offline total.
4. **Simulador de Inscripción por Cuatrimestre:**
   - Planificador semestral para seleccionar materias a cursar en el período entrante y previsualizar carga horaria semanal.

