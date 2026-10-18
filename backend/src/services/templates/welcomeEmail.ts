export interface WelcomeEmailParams {
  to: string;
  name?: string;
  appUrl?: string;
}

export function renderWelcomeEmailHtml({ name, appUrl = 'https://utn-sistemas-frro.web.app' }: WelcomeEmailParams): string {
  const displayName = name?.trim() ? name.trim() : 'Estudiante de Sistemas';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido/a a Tracker UTN Sistemas</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b1120;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0b1120;
      padding: 32px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%);
      padding: 40px 32px 32px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #bfdbfe;
      margin-bottom: 16px;
    }
    .header h1 {
      margin: 0 0 8px;
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.25;
    }
    .header p {
      margin: 0;
      font-size: 15px;
      color: #93c5fd;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 18px;
      color: #f8fafc;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .lead {
      font-size: 15px;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .feature-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .feature-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #38bdf8;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .feature-item {
      display: table;
      width: 100%;
      margin-bottom: 12px;
    }
    .feature-item:last-child {
      margin-bottom: 0;
    }
    .feature-icon {
      display: table-cell;
      width: 32px;
      font-size: 18px;
      vertical-align: top;
      padding-top: 2px;
    }
    .feature-text {
      display: table-cell;
      vertical-align: top;
    }
    .feature-text strong {
      display: block;
      color: #f1f5f9;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .feature-text span {
      display: block;
      color: #94a3b8;
      font-size: 13px;
      line-height: 1.4;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 16px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);
      transition: all 0.2s ease;
    }
    .footer {
      background-color: #0f172a;
      border-top: 1px solid #1e293b;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <div class="badge">UTN FRRo · Plan 2023</div>
        <h1>Tracker ISI</h1>
        <p>Tu carrera organizada paso a paso</p>
      </div>

      <!-- CONTENT -->
      <div class="content">
        <p class="greeting">¡Hola, <strong>${displayName}</strong>! 👋</p>
        <p class="lead">
          Te damos la bienvenida al <strong>Tracker de Ingeniería en Sistemas de Información</strong>. 
          Tu cuenta ha sido vinculada correctamente para que puedas sincronizar tu avance académico 
          en tiempo real desde cualquier dispositivo.
        </p>

        <!-- FEATURES -->
        <div class="feature-card">
          <div class="feature-title">¿Qué podés hacer en el Tracker?</div>
          
          <div class="feature-item">
            <div class="feature-icon">🗺️</div>
            <div class="feature-text">
              <strong>Malla Interactiva y Correlativas</strong>
              <span>Visualizá de inmediato qué materias podés cursar y rendir según tu estado actual.</span>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <div class="feature-text">
              <strong>Planificador de Mesas y Recordatorios</strong>
              <span>Asigná metas a los turnos de examen y te avisaremos 7 días antes para que te anotes en Sysacad.</span>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">🎓</div>
            <div class="feature-text">
              <strong>Títulos ADUSI e Ingeniería</strong>
              <span>Controlá automáticamente las materias, horas electivas y PPS requeridas para recibirte.</span>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div class="feature-text">
              <strong>Promedios y Estadísticas</strong>
              <span>Cálculo automático de promedio con aplazos, sin aplazos y porcentaje total de la carrera.</span>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="cta-container">
          <a href="${appUrl}" target="_blank" class="cta-button">
            Ir a mi Tracker →
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p>
          Este correo fue enviado porque iniciaste sesión o te registraste en 
          <a href="${appUrl}">Tracker UTN Sistemas (FRRo)</a>.
        </p>
        <p>
          Desarrollado para la comunidad de Ingeniería en Sistemas de Información · UTN Facultad Regional Rosario.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function renderWelcomeEmailText({ name, appUrl = 'https://utn-sistemas-frro.web.app' }: WelcomeEmailParams): string {
  const displayName = name?.trim() ? name.trim() : 'Estudiante de Sistemas';
  return `¡Hola, ${displayName}!

Te damos la bienvenida al Tracker de Ingeniería en Sistemas de Información (UTN FRRo · Plan 2023).

Tu cuenta ha sido vinculada correctamente. Con el Tracker podés:
- Visualizar la malla curricular y correlatividades en tiempo real.
- Planificar mesas de examen y recibir recordatorios 7 días antes para anotarte en Sysacad.
- Seguir tu avance hacia el título intermedio (ADUSI) y el título de Ingeniero/a.
- Calcular tus promedios con y sin aplazos automáticamente.

Accedé a tu cuenta en: ${appUrl}

Desarrollado para la comunidad de Ingeniería en Sistemas de Información · UTN Facultad Regional Rosario.`;
}
