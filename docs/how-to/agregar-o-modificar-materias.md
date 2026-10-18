# Guía Práctica: Cómo Agregar o Modificar Asignaturas y Electivas 🛠️

Esta guía te explica cómo actualizar el plan de estudios, modificar correlatividades o dar de alta nuevas materias electivas aprobadas por el Consejo Directivo de la UTN FRRo, garantizando la consistencia y sincronía entre el frontend y el backend.

---

## 🎯 Objetivo
Modificar o dar de alta una materia troncal o electiva en el catálogo oficial de la aplicación, asegurando que:
1. Las correlativas de cursado y rendido sean correctas.
2. Tanto el cliente React como el servidor Node.js compartan la misma información.
3. El grafo interactivo (`vis-network`) y la malla curricular rendericen la nueva asignatura.
4. Las pruebas unitarias pasen satisfactoriamente.

---

## Paso 1: Localizar los Archivos de Datos

La información del Plan 2023 está duplicada estratégicamente entre frontend y backend para permitir la ejecución autónoma (offline-first en cliente y validación server-side en la API):

1. **Frontend:** [frontend/src/data/plan2023.ts](../../frontend/src/data/plan2023.ts)
2. **Backend:** [backend/src/data/plan2023.ts](../../backend/src/data/plan2023.ts)

Ambos archivos implementan los tipos estrictos canónicos definidos en el paquete central `@tracker/types` ([packages/types/src/plan.ts](../../packages/types/src/plan.ts)), consumidos mediante `frontend/src/types/plan.ts` y `backend/src/types/plan.ts`.

---

## Paso 2: Agregar o Modificar una Materia Troncal

La estructura de una materia troncal (`Materia`) requiere los siguientes campos:

```typescript
export interface Materia {
  id: number;                     // Identificador numérico único
  nombre: string;                 // Nombre abreviado para tarjetas compactas (ej. "AM I")
  nombreCompleto: string;         // Nombre oficial completo (ej. "Análisis Matemático I")
  nivel: number;                  // 1, 2, 3, 4 o 5
  horas: number;                  // Carga horaria semanal cátedra
  esIntegradora?: boolean;        // true si es materia eje (ADESI, DSI, ASI, Proyecto Final)
  esCuatrimestral?: boolean;      // true si se dicta en un cuatrimestre
  esAdusiSolo?: boolean;          // true exclusivamente para Seminario Integrador ADUSI
  reqRegular: number[];           // IDs de materias que deben estar REGULARES o APROBADAS para cursar
  reqAprobada: number[] | 'TODAS';// IDs de materias que deben estar APROBADAS para cursar
  reqRendirAprobada?: number[] | 'TODAS'; // Requisitos adicionales de materias APROBADAS para RENDIR el final
}
```

### Ejemplo: Modificar una correlativa
Si se actualiza la reglamentación y *Sistemas de Gestión* (ID: 33) pasa a requerir tener regular *Investigación Operativa* (ID: 27) y *Economía* (ID: 18):

```typescript
// En frontend/src/data/plan2023.ts y backend/src/data/plan2023.ts
{
  id: 33,
  nombre: "Sist. Gestión",
  nombreCompleto: "Sistemas de Gestión",
  nivel: 5,
  horas: 4,
  reqRegular: [18, 27],       // Requisitos para cursar (tener regulares)
  reqAprobada: [23],          // Requisitos para cursar (tener aprobada DSI)
  // reqRendirAprobada se asume implícitamente que reqRegular deben estar aprobadas al rendir
}
```

> [!WARNING]
> Recuerda aplicar el cambio **exactamente igual** en ambos archivos (`frontend/src/data/plan2023.ts` y `backend/src/data/plan2023.ts`).

---

## Paso 3: Agregar una Nueva Materia Electiva

El arreglo `MATERIAS_ELECTIVAS` contiene la oferta de asignaturas electivas del Plan 2023:

```typescript
export interface Electiva {
  id: number;                 // ID numérico (convención: 101 en adelante)
  nombre: string;             // Denominación de la asignatura
  nivel: number;              // Nivel sugerido (4 o 5)
  horas: number;              // Horas cátedra acreditables (ej. 3 o 4)
  tipo: 'Cuatrimestral' | 'Anual';
  cuatrimestre: string;       // "1C", "2C" o "Anual"
  reqRegular: number[];       // IDs de materias troncales que deben estar regulares
  reqAprobada: number[];      // IDs de materias troncales que deben estar aprobadas
}
```

### Ejemplo: Dar de alta una nueva electiva
Para añadir "Computación Cuántica Aplicada" en 5º año (ID 120):

```typescript
{
  id: 120,
  nombre: "Computación Cuántica Aplicada",
  nivel: 5,
  horas: 3,
  tipo: "Cuatrimestral",
  cuatrimestre: "2C",
  reqRegular: [31],           // Requiere regular Inteligencia Artificial (31)
  reqAprobada: [17, 22]       // Requiere aprobadas Probabilidad (17) y Análisis Numérico (22)
}
```

---

## Paso 4: Validar Consistencia y Tests

Una vez modificado el catálogo:

1. **Ejecutar el linter de código:**
   ```bash
   pnpm lint
   ```
2. **Ejecutar los tests automatizados:**
   ```bash
   pnpm test
   ```
3. **Verificación visual:** Inicia `pnpm dev:frontend` y abre el panel de electivas o la malla para confirmar que el nuevo nodo aparece correctamente interconectado en el grafo y la cuadrícula.

