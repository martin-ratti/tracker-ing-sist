# Referencia: Modelo de Datos y Tipos TypeScript 📐

Esta referencia técnica describe los contratos de tipos, interfaces y estructuras de datos canónicas compartidas entre el frontend y el backend de Tracker ISI.

---

## 📌 Ubicación de Archivos de Tipos
- **Paquete Canónico Central:** [packages/types/src/plan.ts](../../packages/types/src/plan.ts) (`@tracker/types`)
- **Frontend (Re-export):** [frontend/src/types/plan.ts](../../frontend/src/types/plan.ts)
- **Backend (Re-export):** [backend/src/types/plan.ts](../../backend/src/types/plan.ts)

---

## 1. Estados Académicos

### `EstadoMateria`
Representa el estado administrativo de una asignatura en la carrera.

```typescript
export type EstadoMateria = 'pendiente' | 'regular' | 'aprobada';
```

| Valor | Descripción | Color Semántico UI |
|---|---|---|
| `'pendiente'` | No cursada, desaprobada o con requisitos previos pendientes. | Neutral / Gris (`--bg-surface`) |
| `'regular'` | Cursada regularizada con trabajos prácticos aprobados. Habilitada para examen final. | Amarillo Ámbar (`--status-regular`) |
| `'aprobada'` | Asignatura aprobada mediante examen final o promoción directa. | Verde Esmeralda (`--status-approved`) |

> [!NOTE]
> El estado "Cursable" es un estado **calculado en tiempo de ejecución** y no se persiste directamente en la base de datos. Una materia es cursable cuando su estado actual es `'pendiente'` y todos sus `reqRegular` y `reqAprobada` están satisfechos.

---

## 2. Definición del Plan de Estudio

### `Materia` (Troncal)
Describe una asignatura troncal obligatoria de la currícula de Ingeniería en Sistemas de Información.

```typescript
export interface Materia {
  id: number;
  nombre: string;
  nombreCompleto: string;
  nivel: number;
  horas: number;
  esIntegradora?: boolean;
  esCuatrimestral?: boolean;
  esAdusiSolo?: boolean;
  reqRegular: number[];
  reqAprobada: number[] | 'TODAS';
  reqRendirAprobada?: number[] | 'TODAS';
}
```

#### Descripción de Campos:
- `id` (`number`): Clave primaria de la materia (1 al 36 para troncales, 99 para Seminario Integrador ADUSI).
- `nombre` (`string`): Nombre corto utilizado en tarjetas, nodos del grafo y vistas compactas (ej. `"AM I"`).
- `nombreCompleto` (`string`): Nombre formal completo oficial de la asignatura (ej. `"Análisis Matemático I"`).
- `nivel` (`number`): Nivel curricular (del 1 al 5).
- `horas` (`number`): Horas reloj semanales cátedra.
- `esIntegradora` (`boolean`, opcional): `true` si es una materia de integración transversal del año (ADESI, DSI, ASI, Proyecto Final).
- `esCuatrimestral` (`boolean`, opcional): `true` si su régimen de cursado es de un cuatrimestre en lugar de anual.
- `esAdusiSolo` (`boolean`, opcional): `true` exclusivamente para el Seminario Integrador ADUSI (ID 99), no forma parte del título de grado de Ingeniería.
- `reqRegular` (`number[]`): Lista de IDs de materias que deben estar en estado `'regular'` o `'aprobada'` para habilitar el cursado.
- `reqAprobada` (`number[] | 'TODAS'`): Lista de IDs de materias que deben estar en estado `'aprobada'` para habilitar el cursado.
- `reqRendirAprobada` (`number[] | 'TODAS'`, opcional): Requisitos adicionales de asignaturas aprobadas exigidas para presentarse a rendir el examen final. Si vale `'TODAS'`, requiere que todas las asignaturas previas del plan estén aprobadas (ej. Proyecto Final).

---

### `Electiva`
Describe una asignatura electiva optativa aprobada en la facultad.

```typescript
export interface Electiva {
  id: number;
  nombre: string;
  nivel: number;
  horas: number;
  tipo: 'Cuatrimestral' | 'Anual';
  cuatrimestre: string;
  reqRegular: number[];
  reqAprobada: number[];
}
```

#### Descripción de Campos:
- `id` (`number`): Identificador (convención: 101 en adelante).
- `horas` (`number`): Carga horaria computable (ej. 3 o 4 horas) para cumplir con el requisito de 4 hs (ADUSI) o 20 hs (Ingeniería).
- `cuatrimestre` (`string`): Periodo de dictado (`"1C"`, `"2C"` o `"Anual"`).

---

## 3. Libreta, Metas y Progreso del Estudiante

### `NotaMateria`
Almacena el registro analítico formal de una asignatura aprobada.

```typescript
export interface NotaMateria {
  nota?: number;        // Calificación numérica del 1 al 10 (aprobado >= 6 o según cátedra)
  fecha?: string;       // Formato ISO YYYY-MM-DD
  libro?: string;       // Tomo / Libro de actas de examen
  folio?: string;       // Folio de acta
  comentario?: string;  // Anotaciones personales o de cátedra
}
```

---

### `PerfilAlumno`
Identificación del estudiante para exportaciones analíticas oficiales en PDF.

```typescript
export interface PerfilAlumno {
  nombre: string;       // Nombre y Apellido completo
  legajo: string;       // Número de legajo universitario en UTN FRRo
}
```

---

### `MetaExamen`
Planificación y compromiso de mesa de examen final.

```typescript
export interface MetaExamen {
  materiaId: number;        // ID de la materia regular que se planea rendir
  turnoId: string;          // Identificador del turno (ej. "feb-mar-2026-t1")
  turnoNombre: string;      // Nombre descriptivo del turno
  fechaEstimada?: string;   // Fecha estimada del examen
  llamado?: number;         // 1 o 2 (para turnos con doble llamado)
  comentario?: string;      // Notas sobre la preparación
  notificado7Dias?: boolean; // Flag para evitar duplicar alertas de Resend
}
```

---

### `ProgresoUsuario`
Contenedor raíz del estado del estudiante, serializado tanto en `localStorage` como en Cloud Firestore y JSON de backend.

```typescript
export interface ProgresoUsuario {
  estados: Record<number, EstadoMateria>;           // Mapeo materiaId -> estado
  estadosElectivas: Record<number, EstadoMateria>;  // Mapeo electivaId -> estado
  notas: Record<number, NotaMateria>;               // Mapeo materiaId -> nota analítica
  ppsHoras: number;                                // Horas acumuladas de Práctica Profesional Supervisada (0 a 200)
  perfil?: PerfilAlumno;                           // Nombre y legajo del alumno
  metasExamen?: Record<number, MetaExamen>;         // Metas activas por materia
  actualizadoEn?: string;                          // Timestamp ISO de última sincronización
}
```

