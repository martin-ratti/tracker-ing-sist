# Guía Práctica: Cómo Actualizar el Calendario Académico y Turnos de Examen 📅

Esta guía explica cómo mantener actualizado el módulo de calendario oficial de la UTN FRRo, añadir nuevos ciclos lectivos, configurar turnos de examen y ajustar feriados o directivas de inscripción de Sysacad.

---

## 🎯 Objetivo
Permitir la incorporación de nuevos turnos de finales (por ejemplo, para el ciclo lectivo 2027 o 2028), asegurando que el cálculo automático de fechas exactas por materia, el cierre de Sysacad (18:00 hs del penúltimo día hábil) y los badges de cuenta regresiva funcionen de manera precisa.

---

## 📂 Arquitectura del Módulo Calendario

El módulo reside en [frontend/src/data/calendario/](../../frontend/src/data/calendario/):

- `anios/`: Define los turnos oficiales, fechas de inicio/fin, llamados y feriados móviles para cada año lectivo (ej. `2026.ts`, `2027.ts`).
- `feriadosFijos.ts`: Generador automático de feriados nacionales inamovibles (Año Nuevo, 25 de Mayo, 9 de Julio, etc.).
- `reglas.ts`: Diccionario de días asignados por materia (`DIAS_MESA_POR_MATERIA`) y cálculo del cierre de inscripción en Sysacad.
- `types.ts`: Tipos TypeScript (`TurnoExamenOficial`, `HitoAcademico`, `DiaSemana`, etc.).
- `index.ts`: Punto de consolidación que expone `TURNOS_EXAMEN` e `HITOS_ACADEMICOS`.

---

## Paso 1: Configurar un Nuevo Año Lectivo o Turno de Examen

Para registrar un nuevo año o turno, crea o edita un archivo dentro de `frontend/src/data/calendario/anios/`:

```typescript
// frontend/src/data/calendario/anios/2027.ts
import type { CicloCalendario } from '../types';

export const CALENDARIO_2027: CicloCalendario = {
  anio: 2027,
  turnos: [
    {
      id: 'feb-mar-2027-t1',
      nombre: 'Feb - Mar 2027 · Turno 1',
      tipo: 'ordinario',
      fechaInicio: '2027-02-15',
      fechaFin: '2027-02-20',
      llamados: 1,
      observaciones: 'Primer turno ordinario del ciclo lectivo 2027'
    },
    // Añadir turnos restantes...
  ],
  hitosBase: [
    {
      id: 'receso-invierno-2027',
      titulo: 'Receso Invernal',
      tipo: 'receso',
      fechaInicio: '2027-07-12',
      fechaFin: '2027-07-24'
    }
  ],
  feriadosMoviles: [
    {
      id: 'carnaval-2027-1',
      titulo: 'Carnaval',
      tipo: 'feriado',
      fechaInicio: '2027-02-08',
      fechaFin: '2027-02-08'
    }
  ]
};
```

---

## Paso 2: Registrar el Ciclo en el Índice Consolidado

Abre [frontend/src/data/calendario/index.ts](../../frontend/src/data/calendario/index.ts) y añade el nuevo ciclo al arreglo `CICLOS_ACTIVOS`:

```typescript
import { CALENDARIO_2026 } from './anios/2026';
import { CALENDARIO_2027 } from './anios/2027';
// import { CALENDARIO_2028 } from './anios/2028';

const CICLOS_ACTIVOS = [CALENDARIO_2026, CALENDARIO_2027];
```

Esto alimentará automáticamente tanto el modal de turnos (`CalendarModal.tsx`) como el selector de metas de examen en `SubjectModal.tsx`.

---

## Paso 3: Asignar Días de Mesa por Materia

Cada cátedra rinde un día fijo de la semana según el cronograma oficial de UTN FRRo. Para asignar o modificar el día de rendida de una materia, edita [frontend/src/data/calendario/reglas.ts](../../frontend/src/data/calendario/reglas.ts):

```typescript
export const DIAS_MESA_POR_MATERIA: Record<number, DiaSemana> = {
  1: 'Lunes',     // Análisis Matemático I
  2: 'Martes',    // Álgebra y Geometría Analítica
  // Si una nueva materia con ID 37 rinde los Jueves:
  37: 'Jueves'
};
```

---

## Paso 4: Entender y Verificar el Cierre de Sysacad

La función `calcularCierreInscripcion(fechaMesaStr)` en `reglas.ts` calcula automáticamente la fecha y hora límite de inscripción:

1. Determina la fecha exacta del examen a partir del lunes de inicio del turno y el día de la semana correspondiente a la materia.
2. Retrocede dos días hábiles descontando fines de semana y feriados registrados.
3. Fija el límite horario en las **18:00 hs** de dicho día hábil.

### Ejemplo:
- Si una mesa se rinde un **Lunes 23 de Febrero**:
  - Penúltimo día hábil: **Jueves 19 de Febrero a las 18:00 hs**.
- Si una mesa se rinde un **Miércoles**:
  - Penúltimo día hábil: **Lunes previo a las 18:00 hs**.

---

## Paso 5: Verificación con Tests

Ejecuta la suite de pruebas del calendario para verificar que los cálculos de días hábiles y turnos se mantengan libres de regresiones:

```bash
pnpm --filter frontend test src/test/data/calendario.test.ts
```

