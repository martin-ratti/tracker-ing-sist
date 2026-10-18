# Explicación: Sincronización Híbrida y Fusión Inteligente (Merge Local ↔ Nube) 🔄

Este documento describe la arquitectura de persistencia de Tracker ISI, su filosofía **Offline-First** y el algoritmo determinista de reconciliación de datos (`mergeProgress`).

---

## 🎯 Filosofía Offline-First

Uno de los pilares de diseño de Tracker ISI es que **ningún estudiante debe estar obligado a registrarse o tener conexión a internet** para usar el 100% de las funciones académicas.

```
┌────────────────────────────────────────────────────────┐
│                   Cliente React 19                     │
│               (TrackerContext / Hooks)                 │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
   [ Sincronización Local ]     [ Sincronización Nube ]
        (Obligatorio)                  (Opcional)
             │                           │
             ▼                           ▼
       localStorage             Firebase Firestore / API Express
 (Persistencia instantánea)       (Multi-dispositivo con JWT)
```

1. **Lectura y Escritura Inmediatas:** Cada click en la malla o cambio de nota se escribe sincrónicamente en `localStorage` bajo la clave `'utn-sistemas-tracker-2023'`.
2. **Resiliencia ante Caídas de Red:** Si la red se interrumpe o el servidor backend está fuera de servicio, la interfaz continúa respondiendo sin demoras ni pantallas de error.

---

## ☁️ El Dilema de la Conexión Tardía

Imaginemos el siguiente escenario común de uso:
1. Un alumno utiliza el tracker en su computadora personal durante semanas sin registrarse (acumulando 15 materias aprobadas y varias notas en `localStorage`).
2. Días después, decide crearse una cuenta o iniciar sesión desde esa misma máquina con una cuenta creada previamente en su teléfono móvil (donde tenía solo 5 materias marcadas).

¿Qué debería suceder al autenticarse?
- **Enfoque ingenuo 1 (Sobrescribir nube con local):** Perdería las notas o materias cargadas desde el teléfono.
- **Enfoque ingenuo 2 (Sobrescribir local con nube):** Perdería todo el progreso de las 15 materias cargadas en la PC.

---

## 🧬 Algoritmo de Fusión sin Pérdida (`mergeProgress`)

Para resolver este conflicto de manera transparente y determinista, el sistema implementa la función `mergeProgress(local, cloud)` en [frontend/src/services/api.ts](../../frontend/src/services/api.ts):

### 1. Jerarquía de Estados Académicos (Lattice de Orden)
Se define una relación de orden parcial estricta:

$$\text{aprobada (3)} > \text{regular (2)} > \text{pendiente (1)}$$

Para cada asignatura $i \in \{\text{Troncales} \cup \text{Electivas}\}$:
$$\text{estadoFinal}_i = \arg\max_{\text{rank}} (\text{estadoLocal}_i, \text{estadoCloud}_i)$$

*Resultado:* Si una materia estaba aprobada en un dispositivo y pendiente en el otro, siempre prevalece el estado más avanzado (**aprobada**).

---

### 2. Reconciliación de Calificaciones y Libreta
Al combinar las calificaciones analíticas (`NotaMateria`):
- Si solo existe en un origen, se preserva íntegramente.
- Si existe en ambos orígenes con notas distintas, se selecciona la calificación más alta y se combinan los campos de libro, folio y anotaciones:
  ```typescript
  mergedNotas[id] = (notaL.nota || 0) >= (notaC.nota || 0)
    ? { ...notaC, ...notaL }
    : { ...notaL, ...notaC };
  ```

---

### 3. Horas de Práctica Profesional Supervisada (PPS)
Dado que las horas de práctica se acumulan de forma incremental:
$$\text{ppsFinal} = \max(\text{ppsLocal}, \text{ppsCloud})$$

---

### 4. Metas de Examen y Perfil Universitario
- Las metas agendadas (`MetaExamen`) se combinan asegurando que ninguna mesa planificada en un dispositivo se pierda por la ausencia de metas en el otro.
- Los campos de perfil (`nombre` y `legajo`) se consolidan dando prioridad al valor no vacío más reciente.

---

## 🛡️ Sanitización Estricta y Seguridad de Almacenamiento (CWE-502 / CWE-79)

Para prevenir ataques de **Browser Storage Poisoning** o inyección de propiedades maliciosas a través de `localStorage`, URLs con hashes manipulados o respuestas de red no confiables, el cliente implementa una capa de sanitización estricta (`sanitizeProgress` y `safeSaveProgressToStorage` en [frontend/src/services/api.ts](../../frontend/src/services/api.ts)):

1. **Validación de Enumeraciones:** Cada estado académico se coteja contra `VALID_ESTADOS` (`'pendiente'`, `'regular'`, `'aprobada'`), descartando cualquier valor arbitrario.
2. **Coerción de Claves Numéricas:** Solo se aceptan IDs de materias enteras positivas dentro de los rangos válidos del Plan 2023.
3. **Aislamiento de Carga Útil:** Los campos de calificaciones (`nota`, `libro`, `folio`, `comentario`) y perfil de usuario (`nombre`, `legajo`) se limpian y escapan como cadenas de texto planas seguras, previniendo riesgos de deserialización no controlada o Cross-Site Scripting (XSS).

---

## 🚀 Conclusión
Gracias a este modelo de datos formal y a las barreras de sanitización activa, Tracker ISI garantiza una experiencia fluida multi-dispositivo (PC, tablet y móvil) sin riesgo de sobrescritura destructiva, corrupción de estado ni vulnerabilidades de inyección en el almacenamiento del navegador.

