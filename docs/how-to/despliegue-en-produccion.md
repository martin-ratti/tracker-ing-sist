# Guía Práctica: Cómo Compilar y Desplegar en Producción (Firebase Hosting) 🚀

Esta guía detalla el procedimiento para compilar el cliente web, validar las optimizaciones de producción y desplegar la aplicación en la infraestructura de Firebase Hosting.

---

## 🎯 Objetivo
Generar los artefactos estáticos optimizados (`frontend/dist`) y publicarlos de manera segura en los dominios oficiales de producción:
- [https://utn-sistemas-frro.web.app](https://utn-sistemas-frro.web.app)
- [https://tracker-isi-frro.web.app](https://tracker-isi-frro.web.app)

---

## 📋 Requisitos Previos

1. **Firebase CLI instalado globalmente:**
   ```bash
   npm install -g firebase-tools
   ```
2. **Sesión iniciada con permisos de despliegue:**
   ```bash
   firebase login
   ```
   *Verifica que tu cuenta tenga acceso al proyecto `tracker-isi-utn-6f213` configurado en [.firebaserc](../../.firebaserc).*

---

## Paso 1: Ejecutar Verificaciones Previas

Antes de compilar, asegúrate de que el código cumpla con las políticas de calidad del proyecto:

```bash
# 1. Verificar linter (0 advertencias)
pnpm lint

# 2. Ejecutar suite de pruebas
pnpm test
```

---

## Paso 2: Compilación de Producción (Build)

Ejecuta el script de compilación del monorepo:

```bash
pnpm build
```

Este comando ejecuta secuencialmente:
1. `pnpm --filter tracker-backend build`: Compilación de TypeScript con `tsc`.
2. `pnpm --filter frontend build`: Compilación con validación de tipos (`tsc -b`) y empaquetado optimizado mediante **Vite 8 + Rolldown**.

### Optimizaciones del empaquetado:
- Los assets en `frontend/dist/assets/` reciben hashes inmutables (`max-age=31536000`).
- La librería `vis-network` se empaqueta en un chunk separado cargado bajo demanda (`React.lazy`), garantizando que la carga inicial de la página sea liviana (~40 kB gzipped).
- Los estilos de **Tailwind CSS v4** son minificados automáticamente.

---

## Paso 3: Previsualización Local del Bundle

Antes de subir a la nube, puedes previsualizar el bundle generado exactamente como se comportará en producción:

```bash
pnpm --filter frontend preview
```

Abre la URL indicada (usualmente `http://localhost:4173`) para validar que las fuentes, iconos de `lucide-react` y temas CSS se visualicen correctamente.

---

## Paso 4: Despliegue a Firebase Hosting

Para desplegar únicamente los sitios web estáticos (Hosting):

```bash
pnpm deploy
# Equivalente a: pnpm build && firebase deploy --only hosting
```

Si también has modificado las reglas de seguridad de Firestore ([firestore.rules](../../firestore.rules)) o índices ([firestore.indexes.json](../../firestore.indexes.json)):

```bash
pnpm deploy:all
# Equivalente a: pnpm build && firebase deploy
```

---

## Paso 5: Verificación en Producción

Una vez completado el despliegue:
1. Accede a [https://utn-sistemas-frro.web.app](https://utn-sistemas-frro.web.app).
2. Abre la consola de desarrollo del navegador (`F12`) y confirma que no existan errores de carga de scripts ni errores de CSP.
3. Prueba la funcionalidad offline desmarcando la conexión de red (Service Workers y `localStorage`).

