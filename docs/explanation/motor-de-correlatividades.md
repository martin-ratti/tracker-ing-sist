# Explicación: Motor de Correlatividades y Resolución en Cascada 🧠

Este documento profundiza en la lógica matemática y algorítmica del motor de validación de correlatividades de Tracker ISI, explicando cómo se garantiza la consistencia académica en todo momento.

---

## 🎯 El Problema Académico

En el régimen de correlatividades de la **UTN Facultad Regional Rosario (Plan 2023)**, existen dos niveles de exigencia diferenciados para cada asignatura:

1. **Requisitos para Cursar:**
   - Materias que deben estar al menos **regulares** (`reqRegular`).
   - Materias que deben estar obligatoriamente **aprobadas** (`reqAprobada`).
2. **Requisitos para Rendir Examen Final:**
   - La materia debe estar previamente en condición **regular**.
   - Todas las materias de `reqRegular` deben estar ahora **aprobadas**.
   - Requisitos especiales adicionales de aprobación (`reqRendirAprobada`), como en *Seminario Integrador ADUSI* o *Proyecto Final*.

---

## ⚙️ Reglas de Transición de Estados

Un estudiante puede transicionar el estado de una materia respetando la siguiente máquina de estados finitos:

```
              ┌───────────────────────────┐
              │                           │
              ▼                           │
        [ PENDIENTE ]                     │
              │                           │ (Degradación voluntaria)
              │ (Cumple cursada)          │
              ▼                           │
        [  REGULAR  ]                     │
              │                           │
              │ (Cumple requisitos final) │
              ▼                           │
        [  APROBADA ] ────────────────────┘
```

### 1. Validación de Cursada (`puedeRegularMateria`)
Una asignatura solo puede pasar a estado `'regular'` si:
$$\forall c \in \text{reqRegular}, \quad \text{estado}(c) \in \{\text{'regular'}, \text{'aprobada'}\}$$
$$\land \quad \forall a \in \text{reqAprobada}, \quad \text{estado}(a) = \text{'aprobada'}$$

### 2. Validación de Examen Final (`puedeAprobarMateria`)
Una asignatura regularizada solo puede pasar a `'aprobada'` si:
$\forall c \in \text{reqRegular}, \quad \text{estado}(c) = \text{'aprobada'}$
$\land \quad \forall a \in \text{reqAprobada}, \quad \text{estado}(a) = \text{'aprobada'}$
$\land \quad \forall r \in \text{reqRendirAprobada}, \quad \text{estado}(r) = \text{'aprobada'}$

---

## 🎓 Casos Especiales del Plan 2023

### Seminario Integrador ADUSI (ID 99)
- **Para Cursar:** Requiere regular *Análisis de Sistemas* (16) y aprobadas *Algoritmos* (6), *Sistemas y Procesos* (8), *Sintaxis* (13) y *Paradigmas* (14).
- **Para Rendir Final:** Exige formalmente tener **aprobadas las 23 materias completas de 1º, 2º y 3º año**.

### Proyecto Final (ID 36)
- **Para Cursar:** Requiere regulares *Ingeniería y Calidad* (25), *Redes* (26) y *Administración de SI* (30), y aprobadas *Inglés II* (12), *Desarrollo de Software* (20) y *Diseño de SI* (23).
- **Para Rendir Final:** Posee `reqRendirAprobada: 'TODAS'`, lo que exige tener aprobadas absolutamente todas las asignaturas troncales anteriores de la carrera.

---

## 🌊 Algoritmo de Propagación en Cascada (`applyCascade`)

¿Qué sucede cuando un usuario desmarca una materia que ya tenía aprobada o regularizada?

Si el sistema simplemente permitiera cambiar el estado de esa materia a `'pendiente'`, la base de datos quedaría en un **estado inconsistente**, con materias avanzadas aprobadas cuyos requisitos ya no se cumplen.

Para resolver esto, Tracker ISI implementa un **algoritmo iterativo de punto fijo** en [frontend/src/context/TrackerContext.tsx](../../frontend/src/context/TrackerContext.tsx):

```typescript
let changed = true;
while (changed) {
  changed = false;

  MATERIAS_TRONCALES.forEach(m => {
    const est = newEstados[m.id] || 'pendiente';
    if (est === 'pendiente') return;

    // Verificar requisitos de cursada
    const regularOk = m.reqRegular.every(c => isRegularOrApproved(c));
    const aprobadaOk = isApproved(m.reqAprobada);

    if (!regularOk || !aprobadaOk) {
      // Si ya no puede ni cursarla, vuelve a pendiente
      newEstados[m.id] = 'pendiente';
      changed = true;
    } else if (est === 'aprobada' && m.reqRendirAprobada) {
      // Si la tenía aprobada pero perdió un requisito de rendida, baja a regular
      const rendirOk = isApproved(m.reqRendirAprobada);
      if (!rendirOk) {
        newEstados[m.id] = 'regular';
        changed = true;
      }
    }
  });

  // Repetir validación para materias electivas...
}
```

### Propiedades del Algoritmo:
1. **Convergencia Garantizada:** Dado que el grafo de correlatividades es un **Grafo Acíclico Dirigido (DAG)** y los estados solo se degradan (`aprobada` $\to$ `regular` $\to$ `pendiente`), el bucle converge en un número finito de iteraciones proporcional a la profundidad máxima del grafo (máximo 5 iteraciones correspondientes a los 5 niveles académicos).
2. **Degradación Inteligente:** No resetea todo a cero; si una materia pierde los requisitos de final pero aún cumple los de cursada, se degrada a `'regular'` conservando el avance del año.
3. **Notificación Contextual y Acción Deshacer:** Cuando el usuario intenta forzar un estado no válido, el sistema emite un Toast alertando qué asignaturas exactas impiden la acción. Al resetear una materia a pendiente, el Toast incorpora un botón *Deshacer* para revertir la acción inmediatamente.
4. **Protección contra Reseteos Masivos (`CascadeConfirmModal`):** Si desmarcar una asignatura base degrada más de 3 materias correlativas avanzadas, se suspende la ejecución automática y se solicita confirmación interactiva al estudiante detallando todas las materias afectadas.

