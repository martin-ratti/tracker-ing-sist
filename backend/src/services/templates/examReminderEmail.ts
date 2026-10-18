export interface ExamReminderEmailParams {
  to: string;
  studentName?: string;
  subjectName: string;
  examDate: string;
  turnoNombre: string;
  llamado?: number;
  diasFaltantes?: number;
  sysacadUrl?: string;
  appUrl?: string;
}

export function renderExamReminderEmailHtml({
  studentName,
  subjectName,
  examDate,
  turnoNombre,
  llamado,
  diasFaltantes = 7,
  sysacadUrl = 'https://alumnos.frro.utn.edu.ar/loginAlumno.asp?refrescar',
  appUrl = 'https://utn-sistemas-frro.web.app'
}: ExamReminderEmailParams): string {
  const displayName = studentName?.trim() ? studentName.trim() : 'Estudiante';
  const llamadoStr = llamado ? `Llamado ${llamado}` : 'Mesa regular';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Examen Final: ${subjectName}</title>
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
      background: linear-gradient(135deg, #b45309 0%, #d97706 50%, #ea580c 100%);
      padding: 36px 32px 28px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #fef3c7;
      margin-bottom: 12px;
    }
    .header h1 {
      margin: 0 0 6px;
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.25;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      color: #fde68a;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 17px;
      color: #f8fafc;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .lead {
      font-size: 15px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 24px;
    }
    .highlight-card {
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      text-align: center;
    }
    .highlight-subject {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .details-grid {
      display: table;
      width: 100%;
      margin: 16px 0;
      border-top: 1px solid #334155;
      padding-top: 16px;
    }
    .detail-col {
      display: table-cell;
      width: 50%;
      text-align: center;
      vertical-align: middle;
    }
    .detail-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .detail-value {
      font-size: 16px;
      font-weight: 700;
      color: #38bdf8;
    }
    .warning-box {
      background-color: rgba(245, 158, 11, 0.1);
      border-left: 4px solid #f59e0b;
      padding: 16px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 24px;
    }
    .warning-title {
      font-size: 14px;
      font-weight: 700;
      color: #fbbf24;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .warning-desc {
      font-size: 13px;
      line-height: 1.5;
      color: #e2e8f0;
      margin: 0;
    }
    .checklist-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .checklist-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #38bdf8;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .checklist-item {
      font-size: 13px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 8px;
    }
    .checklist-item:last-child {
      margin-bottom: 0;
    }
    .cta-container {
      text-align: center;
      margin: 28px 0 16px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 14px 0 rgba(217, 119, 6, 0.4);
      margin-right: 8px;
      margin-bottom: 8px;
    }
    .secondary-button {
      display: inline-block;
      background-color: #1e293b;
      border: 1px solid #475569;
      color: #cbd5e1 !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 13px 24px;
      border-radius: 10px;
      margin-bottom: 8px;
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
        <div class="badge">⏰ Recordatorio de Mesa · Faltan ${diasFaltantes} días</div>
        <h1>¡Hora de anotarse a la mesa!</h1>
        <p>${subjectName}</p>
      </div>

      <!-- CONTENT -->
      <div class="content">
        <p class="greeting">¡Hola, <strong>${displayName}</strong>!</p>
        <p class="lead">
          Tenés asignada una meta de examen para rendir en el próximo turno. 
          Te enviamos este aviso <strong>7 días antes</strong> para que tengas tiempo suficiente 
          de anotarte formalmente en Sysacad.
        </p>

        <!-- HIGHLIGHT CARD -->
        <div class="highlight-card">
          <div class="highlight-subject">📘 ${subjectName}</div>
          <div class="details-grid">
            <div class="detail-col">
              <div class="detail-label">Fecha del Examen</div>
              <div class="detail-value">${examDate}</div>
            </div>
            <div class="detail-col">
              <div class="detail-label">Turno / Mesa</div>
              <div class="detail-value">${turnoNombre} (${llamadoStr})</div>
            </div>
          </div>
        </div>

        <!-- WARNING BOX -->
        <div class="warning-box">
          <div class="warning-title">⚠️ Importante sobre los plazos de Sysacad</div>
          <p class="warning-desc">
            La inscripción a exámenes finales suele cerrar <strong>48 a 72 horas hábiles</strong> 
            antes de la fecha del examen. ¡No esperes a último momento para inscribirte!
          </p>
        </div>

        <!-- CHECKLIST -->
        <div class="checklist-card">
          <div class="checklist-title">Checklist antes de rendir</div>
          <div class="checklist-item">✅ <strong>Inscribite en Sysacad:</strong> Verificá que el trámite quede confirmado y guardá el comprobante.</div>
          <div class="checklist-item">✅ <strong>Revisá las correlativas:</strong> Asegurate de tener firmada la regularidad y aprobadas las correlativas de final.</div>
          <div class="checklist-item">✅ <strong>Documentación:</strong> Recordá llevar DNI físico o Libreta Universitaria el día del examen.</div>
        </div>

        <!-- CTA -->
        <div class="cta-container">
          <a href="${sysacadUrl}" target="_blank" class="cta-button">
            Ir a Sysacad UTN Rosario →
          </a>
          <a href="${appUrl}" target="_blank" class="secondary-button">
            Ver mis Metas en el Tracker
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p>
          Recibiste este recordatorio porque configuraste una meta de examen en 
          <a href="${appUrl}">Tracker UTN Sistemas (Plan 2023)</a>.
        </p>
        <p>
          ¡Muchos éxitos en tu examen! · UTN Facultad Regional Rosario
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function renderExamReminderEmailText({
  studentName,
  subjectName,
  examDate,
  turnoNombre,
  llamado,
  diasFaltantes = 7,
  sysacadUrl = 'https://alumnos.frro.utn.edu.ar/loginAlumno.asp?refrescar',
  appUrl = 'https://utn-sistemas-frro.web.app'
}: ExamReminderEmailParams): string {
  const displayName = studentName?.trim() ? studentName.trim() : 'Estudiante';
  const llamadoStr = llamado ? `Llamado ${llamado}` : 'Mesa regular';

  return `¡Hola, ${displayName}!

⏰ RECORDATORIO DE EXAMEN FINAL (Faltan ${diasFaltantes} días)

Tenés asignada una meta para rendir:
- Materia: ${subjectName}
- Fecha del examen: ${examDate}
- Turno: ${turnoNombre} (${llamadoStr})

⚠️ IMPORTANTE:
La inscripción en Sysacad cierra 48 a 72 horas hábiles antes de la mesa. Inscribite con anticipación para no quedar fuera de las actas de examen.

Inscribite en Sysacad: ${sysacadUrl}
Revisá tus metas en el Tracker: ${appUrl}

Checklist para el examen:
- Inscripción en Sysacad confirmada.
- Correlativas requeridas aprobadas.
- DNI físico o Libreta Universitaria.

¡Muchos éxitos!
Tracker UTN Sistemas · UTN FRRo`;
}
