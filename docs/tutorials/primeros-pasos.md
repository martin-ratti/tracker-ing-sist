# Tutorial: Primeros Pasos con Tracker ISI 🚀

Este tutorial te guiará paso a paso para configurar tu entorno de desarrollo local, instalar dependencias, ejecutar el frontend y el backend de forma concurrente, y realizar tu primera modificación verificada en el código.

Al finalizar este tutorial, tendrás:
1. El proyecto ejecutándose localmente en tu navegador.
2. Un servidor backend respondiendo a peticiones API.
3. El frontend de React 19 interactuando con la interfaz del plan de estudios.
4. Las herramientas de verificación (`lint` y `test`) configuradas y probadas.

---

## 📋 Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu sistema operativo:
- **Node.js**: Versión `20.x` o superior (se recomienda LTS `v22+`).
- **pnpm**: Versión `9.x` o `10.x` (`npm install -g pnpm`).
- **Git**: Para control de versiones.

Verifica tus versiones en la terminal:
```bash
node -v
pnpm -v
git --version
```

---

## Paso 1: Clonar el Repositorio e Instalar Dependencias

Clona el proyecto y sitúate en el directorio raíz:

```bash
git clone https://github.com/martin-ratti/tracker-ing-sist.git
cd tracker-ing-sist
```

El proyecto es un monorepo administrado con `pnpm workspaces`. Instala todas las dependencias de los paquetes `frontend`, `backend` y la raíz con un solo comando:

```bash
pnpm install
```

> [!NOTE]
> `pnpm` resuelve las dependencias cruzadas entre [backend/package.json](../../backend/package.json) y [frontend/package.json](../../frontend/package.json) mediante enlaces simbólicos instantáneos sin duplicar almacenamiento en disco.

---

## Paso 2: Configurar Variables de Entorno

### Configuración del Backend
Dirígete a la carpeta `backend/` y crea el archivo `.env` a partir de las configuraciones recomendadas:

```bash
# Dentro de tracker-ing-sist/backend/.env
PORT=3001
JWT_SECRET=tu_clave_secreta_para_desarrollo_local_12345
CLIENT_ORIGIN=http://localhost:5173
DATA_DIR=./data
```

### Configuración del Frontend
El frontend funciona de manera **offline-first** de forma predeterminada usando `localStorage`. Si deseas habilitar la sincronización en la nube con Firebase Auth y Firestore, crea el archivo `frontend/.env`:

```bash
# Dentro de tracker-ing-sist/frontend/.env
VITE_API_URL=http://localhost:3001
# Opcional (si cuentas con proyecto Firebase propio):
# VITE_FIREBASE_API_KEY=tu_api_key
# VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
# VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
# VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
# VITE_FIREBASE_APP_ID=tu_app_id
```

---

## Paso 3: Iniciar el Entorno de Desarrollo

Desde la raíz del repositorio, ejecuta el script concurrente que levanta simultáneamente el servidor backend (Node.js + TSX en modo watch) y el cliente Vite (React 19 + HMR):

```bash
pnpm dev
```

En la salida de la consola verás:
- `[BACKEND]` corriendo en `http://localhost:3001`
- `[FRONTEND]` corriendo en `http://localhost:5173`

Abre tu navegador en [http://localhost:5173](http://localhost:5173). Deberías ver la Malla Curricular o el Grafo interactivo del Plan 2023 de Ingeniería en Sistemas de Información.

---

## Paso 4: Explorar la Interfaz

1. **Interactuar con una materia:** Haz clic sobre una materia de 1º año (por ejemplo, *Álgebra y Geometría Analítica*). Observa cómo transiciona de estado:
   - 1 clic: **Regular** (amarillo)
   - 2 clics: **Aprobada** (verde)
   - 3 clics: **Pendiente** (gris/neutro)
2. **Observar la reactividad:** Al aprobar *Álgebra* y *Análisis Matemático I*, fíjate cómo materias de 2º año dependientes (como *Análisis Matemático II*) se iluminan y pasan a estado **Cursable** con animación de pulso cian.
3. **Cambiar tema visual:** En la barra superior (`Header`), haz clic en el botón de temas y cambia entre *Cyber Blueprint*, *Neon Synthwave*, *Emerald Matrix*, *Amber Sunset* o *Nordic Frost*.
4. **Ver el Grafo:** Haz clic en la pestaña "Grafo de Correlativas" para explorar el diagrama de red jerárquico cargado dinámicamente mediante `vis-network`.

---

## Paso 5: Realizar tu Primera Modificación

Vamos a realizar un cambio sencillo para comprobar el Hot Module Replacement (HMR).

Abre el archivo [frontend/src/components/layout/Header.tsx](../../frontend/src/components/layout/Header.tsx). Busca el título del componente y observa cómo los estilos utilizan clases de Tailwind CSS v4 con variables semánticas:

```tsx
// Ejemplo en Header.tsx
<h1 className="text-lg font-bold tracking-tight text-(--text-title)">
  Tracker ISI · UTN FRRo
</h1>
```

Guarda el archivo y observa cómo el navegador actualiza la interfaz al instante sin recargar la página completa ni perder el estado académico que habías marcado.

---

## Paso 6: Validar Calidad de Código y Pruebas

Antes de enviar cualquier cambio, ejecuta las herramientas de calidad configuradas en el proyecto:

1. **Linter ultrarrápido con Oxlint:**
   ```bash
   pnpm lint
   ```
   *Debe arrojar 0 advertencias y 0 errores.*

2. **Suite de pruebas unitarias e integración:**
   ```bash
   pnpm test
   ```
   *Ejecutará las 24 suites de pruebas en el frontend (195 tests con Vitest + React Testing Library) y las pruebas del backend (46 tests con Supertest y almacenamiento).*

---

## 🎉 ¡Felicitaciones!

Has completado el tutorial de configuración inicial. Ahora tu entorno está completamente operativo para colaborar en el proyecto.

### Siguientes pasos recomendados:
- Para aprender a agregar o editar asignaturas, consulta la guía [Cómo agregar o modificar asignaturas y electivas](../how-to/agregar-o-modificar-materias.md).
- Para comprender cómo se calculan las correlatividades y las cascadas, lee la explicación [Motor de Correlatividades y Resolución en Cascada](../explanation/motor-de-correlatividades.md).

