# Referencia: API REST del Backend 🌐

Esta especificación describe todos los endpoints, contratos de petición y respuesta, códigos de error y mecanismos de seguridad de la API de Tracker ISI.

---

## 📌 Configuración y Servidor
- **Archivo fuente:** [backend/src/routes/api.ts](../../backend/src/routes/api.ts)
- **Servidor Express:** [backend/src/server.ts](../../backend/src/server.ts)
- **Prefijo base:** `/api`
- **Puerto local predeterminado:** `3001`
- **Formato de datos:** `application/json`

---

## 🛡️ Mecanismos de Seguridad y Autenticación

1. **Tokens JWT (JSON Web Tokens):**
   - Transmitidos en el encabezado HTTP: `Authorization: Bearer <TOKEN>`.
   - Firmados con algoritmo HMAC SHA-256 utilizando `JWT_SECRET`.
2. **Cifrado de Contraseñas:**
   - Cifradas mediante **Bcrypt** con salt cost factor de 10 antes de persistir.
3. **Limitador de Tasa (Rate Limiting):**
   - Las rutas `/api/auth/register` y `/api/auth/login` aplican una ventana de **60 segundos** con un máximo de **10 peticiones** por IP. Exceder el límite retorna HTTP 429.

---

## 1. Endpoints Generales

### `GET /api/health`
Comprueba el estado operativo del servicio.

- **Autenticación:** No requerida.
- **Respuesta Exitosa (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-10-18T00:00:00.000Z"
}
```

---

### `GET /api/plan`
Retorna el catálogo completo del Plan 2023 (materias troncales, electivas oficiales y requisitos de títulos).

- **Autenticación:** No requerida.
- **Respuesta Exitosa (200 OK):**
```json
{
  "carrera": "Ingeniería en Sistemas de Información",
  "facultad": "UTN FRRo",
  "plan": "2023",
  "materiasTroncales": [ /* Array de Materia */ ],
  "materiasElectivas": [ /* Array de Electiva */ ],
  "titulos": {
    "adusi": {
      "nombre": "Analista Desarrollador Universitario en Sistemas de Información",
      "requisitos": {
        "nivelesCompletos": [1, 2, 3],
        "requiereSeminario": true,
        "horasElectivasMinimas": 4
      }
    },
    "ingenieria": {
      "nombre": "Ingeniero/a en Sistemas de Información",
      "requisitos": {
        "todasTroncales": true,
        "horasElectivasMinimas": 20,
        "ppsHorasMinimas": 200
      }
    }
  }
}
```

---

## 2. Endpoints de Autenticación

### `POST /api/auth/register`
Registra una nueva cuenta de usuario en el sistema.

- **Limitador:** 10 peticiones / minuto.
- **Cuerpo de la Petición (JSON):**
```json
{
  "email": "estudiante@frro.utn.edu.ar",
  "password": "PasswordSeguro123"
}
```
- **Respuestas:**
  - `201 Created`:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOi...",
      "user": {
        "id": "usr_9a8b7c6d",
        "email": "estudiante@frro.utn.edu.ar"
      }
    }
    ```
  - `400 Bad Request`: Formato de correo inválido o contraseña menor a 6 caracteres.
  - `409 Conflict`: Correo electrónico ya registrado.
  - `429 Too Many Requests`: Límite de tasa excedido.

---

### `POST /api/auth/login`
Inicia sesión y genera un nuevo token JWT.

- **Limitador:** 10 peticiones / minuto.
- **Cuerpo de la Petición (JSON):**
```json
{
  "email": "estudiante@frro.utn.edu.ar",
  "password": "PasswordSeguro123"
}
```
- **Respuestas:**
  - `200 OK`: Devuelve token y datos de usuario (mismo esquema que register).
  - `401 Unauthorized`: Credenciales inválidas.
  - `429 Too Many Requests`: Límite de tasa excedido.

---

### `GET /api/auth/me`
Obtiene la información del perfil del usuario autenticado.

- **Encabezados:** `Authorization: Bearer <TOKEN>`
- **Respuestas:**
  - `200 OK`:
    ```json
    {
      "user": {
        "id": "usr_9a8b7c6d",
        "email": "estudiante@frro.utn.edu.ar"
      }
    }
    ```
  - `401 Unauthorized`: Token ausente o expirado.

---

## 3. Endpoints de Progreso Académico

> [!NOTE]
> Estas rutas implementan **autenticación opcional**. Si se envía el encabezado `Authorization`, el progreso se asocia al usuario autenticado. De lo contrario, se almacena en una sesión anónima predeterminada.

### `GET /api/progress`
Recupera el progreso académico actual guardado.

- **Respuesta (200 OK):**
```json
{
  "estados": { "1": "aprobada", "2": "regular" },
  "estadosElectivas": { "101": "aprobada" },
  "notas": {
    "1": { "nota": 9, "fecha": "2025-12-15", "libro": "45", "folio": "120" }
  },
  "ppsHoras": 60,
  "perfil": {
    "nombre": "Martín Estudiante",
    "legajo": "49500"
  },
  "metasExamen": {},
  "actualizadoEn": "2026-10-18T00:25:00.000Z"
}
```

---

### `POST /api/progress`
Actualiza parcialmente o en su totalidad el progreso del estudiante.

- **Cuerpo de la Petición (JSON):** Acepta cualquier subconjunto válido de `ProgresoUsuario`.
- **Respuestas:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": { /* ProgresoUsuario actualizado */ }
    }
    ```
  - `400 Bad Request`: Tipos de datos inválidos en los campos enviados.

---

### `POST /api/progress/reset`
Restablece a cero todos los estados, notas y metas del usuario.

- **Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "estados": {},
    "estadosElectivas": {},
    "notas": {},
    "ppsHoras": 0,
    "perfil": { "nombre": "", "legajo": "" },
    "metasExamen": {}
  }
}
```

---

## 4. Endpoints de Correo y Notificaciones (Resend) 📬

Integración con el servicio **Resend** para notificaciones transaccionales y alertas de exámenes.

### `POST /api/mail/welcome`
Envía el correo de bienvenida formateado e institucional con resumen de funcionalidades del Tracker.

- **Limitador:** 10 peticiones / minuto.
- **Autenticación:** Opcional (si está autenticado toma el email de sesión).
- **Cuerpo de la Petición (JSON):**
```json
{
  "email": "estudiante@frro.utn.edu.ar",
  "name": "Martín"
}
```
- **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "recipient": "estudiante@frro.utn.edu.ar",
  "id": "01a14f7a-..."
}
```

---

### `POST /api/mail/check-reminders`
Ejecuta la revisión de todas las metas de exámenes guardadas (`metasExamen`) y despacha alertas a los alumnos cuyas mesas se rinden en **7 días**. Incluye el enlace directo a Sysacad Alumnos (`https://alumnos.frro.utn.edu.ar/loginAlumno.asp?refrescar`).

- **Autenticación:** Requerida (`Bearer <TOKEN>`).
- **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "report": {
    "checkedUsers": 12,
    "sentReminders": 2,
    "details": [
      {
        "userId": "usr_123",
        "email": "alumno@frro.utn.edu.ar",
        "materiaNombre": "Sistemas Operativos",
        "fechaExamen": "Martes 24 de Noviembre de 2026",
        "diasFaltantes": 7
      }
    ]
  }
}
```

---

### ⏰ Scheduler Automático
El servidor Express ejecuta en segundo plano un temporizador diario (`startReminderScheduler()`) que dispara automáticamente la revisión de metas cada 24 horas sin requerir invocaciones manuales.


