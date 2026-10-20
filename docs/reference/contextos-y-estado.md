# Referencia: Contextos y Gestión de Estado React ⚛️

Esta referencia técnica documenta los Context Providers y Hooks que orquestan el estado global reactivo de la aplicación cliente en React 19.

---

## 📌 Mapa de Contextos

```
App.tsx
├── ThemeProvider (frontend/src/context/ThemeContext.tsx)
├── AuthProvider (frontend/src/context/AuthContext.tsx)
└── TrackerProvider (frontend/src/context/TrackerContext.tsx)
    └── UIProvider (frontend/src/context/UIContext.tsx)
```

---

## 1. `TrackerContext`
Ubicación: [frontend/src/context/TrackerContext.tsx](../../frontend/src/context/TrackerContext.tsx)  
Hook de acceso: `useTracker()`

Es el núcleo de la lógica académica y de interacción de la plataforma.

### Estado Principal (State)
- `estados: Record<number, EstadoMateria>`: Estados actuales de las 36 materias troncales y Seminario ADUSI.
- `estadosElectivas: Record<number, EstadoMateria>`: Estados de las asignaturas electivas.
- `notas: Record<number, NotaMateria>`: Registro de calificaciones, fechas, libros y folios de examen.
- `ppsHoras: number`: Horas acumuladas de Práctica Profesional Supervisada (0 a 200 hs).
- `perfil: PerfilAlumno`: Nombre y Legajo del estudiante.
- `metasExamen: Record<number, MetaExamen>`: Planificación de turnos de examen agendados.

### Controles de Interfaz y Filtros
- `viewMode: 'grafo' | 'malla'`: Alterna la vista principal.
- `edgeMode: 'ambos' | 'regular' | 'aprobada'`: Filtro de aristas en el grafo de dependencias.
- `gridFilter: GridFilterOption`: Filtro rápido en la malla (`'todas'`, `'cursables'`, `'regulares'`, `'aprobadas'`, `'con-meta'`).
- `selectedSubjectId: number | null`: Materia actualmente abierta en el modal de detalle (`SubjectModal`).
- `focusedSubjectId: number | null`: Nodo enfocado para inspección de camino crítico (atenúa el resto).

### Predicados de Validación Académica
- `puedeRegularMateria(m: Materia): boolean`: Evalúa si el alumno cumple los `reqRegular` y `reqAprobada` para cursar.
- `puedeAprobarMateria(m: Materia): boolean`: Evalúa si se cumplen los requisitos para aprobar o rendir final.
- `esMateriaCursable(m: Materia): boolean`: Retorna `true` si la materia está pendiente y habilitada para cursar.
- `esMateriaRendible(m: Materia): boolean`: Retorna `true` si la materia está regular y habilitada para rendir final.

### Acciones de Mutación y Respaldo
- `toggleMateriaEstado(id: number)`: Cicla el estado de la materia (Pendiente ➔ Regular ➔ Aprobada ➔ Pendiente). Si pasa a Pendiente, ejecuta el reseteo en cascada.
- `setEstadoDirecto(id: number, estado: EstadoMateria)`: Asigna directamente un estado validando correlatividades.
- `setNotaMateria(id: number, nota: NotaMateria)`: Guarda la calificación y datos de libreta.
- `setMetaExamen(materiaId: number, meta: MetaExamen)`: Agenda un examen en un turno oficial.
- `exportBackupJson()`: Genera y descarga un archivo de respaldo local `.json` versionado (`tracker-isi-[legajo]-[fecha].json`) con todo el avance.
- `importBackupJson(jsonStr: string): boolean`: Valida y restaura el 100% del progreso desde una copia de seguridad en JSON.
- `resetAll()`: Reinicia todo el progreso a estado inicial tras confirmación.

### Métricas Académicas (`stats`)
- `aprobadasCount`, `regularesCount`, `cursablesCount`, `porcentajeCarrera`.
- `promedio`, `promedioConAplazos`, `promedioSinAplazos`.
- `adusiCumplido`, `adusiProgreso` (0 a 100%), `adusiFaltantes`.
- `ingenieroCumplido`, `ingenieroProgreso` (0 a 100%), `ingenieroFaltantes`.
- `proximaMeta`: Información en tiempo real del examen más próximo con cuenta regresiva en días.

---

## 2. `AuthContext`
Ubicación: [frontend/src/context/AuthContext.tsx](../../frontend/src/context/AuthContext.tsx)  
Hook de acceso: `useAuth()`

Gestiona la identidad del usuario, tokens JWT y la sincronización entre `localStorage` y la nube (soporte híbrido Firebase Auth / Cloud Firestore en producción y backend Node.js Express con JWT).

### Propiedades y Métodos
- `user: User | null`: Objeto con `id` y `email`.
- `token: string | null`: Token JWT de sesión almacenado en `localStorage`.
- `isLoading: boolean`: Estado de carga de credenciales.
- `login(email, password)`: Inicio de sesión.
- `register(email, password)`: Registro de cuenta.
- `logout()`: Cierre de sesión y limpieza de tokens.
- `syncStatus: 'idle' | 'syncing' | 'saved' | 'error'`: Estado visual del indicador de sincronización en la cabecera.

---

## 3. `ThemeContext`
Ubicación: [frontend/src/context/ThemeContext.tsx](../../frontend/src/context/ThemeContext.tsx)  
Hook de acceso: `useTheme()`

Administra la paleta visual activa inyectando atributos `data-theme` y variables de color.

### Temas Disponibles (`ThemeId`):
1. `'cyber'`: Cyber Blueprint (Cian Tech y Azul noche).
2. `'synthwave'`: Neon Synthwave (Púrpura y Rosa fucsia).
3. `'matrix'`: Emerald Matrix (Verde hacker terminal y menta).
4. `'sunset'`: Amber Sunset (Naranja fuego y ámbar cálido).
5. `'frost'`: Nordic Frost (Azul glacial polar e índigo).

Soporta además modo claro/oscuro (`ColorMode: 'dark' | 'light'`) y provee la configuración cromática específica (`graph`) para los nodos de `vis-network`.

---

## 4. Custom Hooks Utilitarios

### `useFocusTrap(ref, isActive)`
Ubicación: [frontend/src/hooks/useFocusTrap.ts](../../frontend/src/hooks/useFocusTrap.ts)  
Garantiza el cumplimiento de accesibilidad **WCAG 2.2 AA**:
- Atrapa la tecla `Tab` dentro de los modales para que el teclado no escape hacia el fondo de la página.
- Restaura el foco en el botón que originó la apertura al cerrar el modal.

### `useKeyboardShortcuts(shortcuts)`
Ubicación: [frontend/src/hooks/useKeyboardShortcuts.ts](../../frontend/src/hooks/useKeyboardShortcuts.ts)  
Mapea atajos globales de teclado ignorando inputs de texto:
- `G`: Cambiar a vista de Grafo de Correlatividades.
- `M`: Cambiar a vista de Malla Curricular.
- `E`: Abrir panel de Asignaturas Electivas.
- `C`: Abrir Calendario de Turnos y Finales.
- `T`: Abrir panel de Titulación (ADUSI / Ingeniería).
- `R`: Abrir Ficha Curricular y Analítico en PDF.
- `P`: Abrir Perfil del Alumno y Respaldo JSON.
- `S`: Compartir Avance (enlace comprimido).
- `A`: Iniciar Sesión / Cuenta de Usuario.
- `?`: Abrir Guía Interactiva y Atajos.
- `Escape`: Cerrar cualquier diálogo o panel abierto.

### `useHistoryBack(isOpen, onClose)`
Ubicación: [frontend/src/hooks/useHistoryBack.ts](../../frontend/src/hooks/useHistoryBack.ts)  
Sincroniza el historial del navegador (`history.pushState`) con el estado de apertura de los modales, permitiendo cerrarlos con el botón físico o gesto de "Atrás" en dispositivos móviles.

### `useModalAnimation(isOpen, durationMs)`
Ubicación: [frontend/src/hooks/useModalAnimation.ts](../../frontend/src/hooks/useModalAnimation.ts)  
Gestiona el ciclo de vida de renderizado y desmontaje de modales (`isMounted` y `isVisible`), garantizando transiciones de opacidad y escala fluidas tanto al abrir como al cerrar sin cortes bruscos.

---

## 5. `UIContext`
Ubicación: [frontend/src/context/UIContext.tsx](../../frontend/src/context/UIContext.tsx)  
Hook de acceso: `useUI()`

Provee estado visual complementario desacoplado de la lógica académica:
- Control de visibilidad de modales: `reportOpen`, `profileModalOpen`, `helpModalOpen`, `statsModalOpen`, `titlesModalOpen`, `shareModalOpen`, `authModalOpen`.
- Control del menú deslizable en móviles: `drawerOpen`, `setDrawerOpen`.
- Sistema de notificaciones flotantes: `toast` y `showToast(mensaje, tipo)`.

