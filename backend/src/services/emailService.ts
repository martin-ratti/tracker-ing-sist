import { Resend } from 'resend';
import { renderWelcomeEmailHtml, renderWelcomeEmailText, type WelcomeEmailParams } from './templates/welcomeEmail.js';
import { renderExamReminderEmailHtml, renderExamReminderEmailText, type ExamReminderEmailParams } from './templates/examReminderEmail.js';

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  // En entorno de test (Vitest o NODE_ENV=test), jamás inicializar Resend para evitar envíos de emails reales
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return null;
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith('re_tu_api_key')) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM || 'Tracker UTN Sistemas <onboarding@resend.dev>';
}

/**
 * Resuelve el destinatario real del correo.
 * Si EMAIL_OVERRIDE_TO está configurado (por ejemplo para revisión o pruebas),
 * redirige todos los correos salientes a esa dirección.
 */
export function resolveRecipient(originalTo: string): string {
  const override = process.env.EMAIL_OVERRIDE_TO?.trim();
  if (override && override.includes('@')) {
    return override;
  }
  return originalTo;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
  recipient: string;
}

/**
 * Envía el correo de bienvenida al estudiante
 */
export async function sendWelcomeEmail({ to, name, appUrl }: WelcomeEmailParams): Promise<EmailResult> {
  const resend = getResendClient();
  const effectiveRecipient = resolveRecipient(to);

  if (!resend) {
    const errorMsg = 'RESEND_API_KEY no está configurada en las variables de entorno.';
    if (!process.env.VITEST) {
      console.warn(`[EmailService] ${errorMsg} (Simulación de envío a ${effectiveRecipient})`);
    }
    return { success: false, error: errorMsg, recipient: effectiveRecipient };
  }

  try {
    const from = getFromEmail();
    const html = renderWelcomeEmailHtml({ to: effectiveRecipient, name, appUrl });
    const text = renderWelcomeEmailText({ to: effectiveRecipient, name, appUrl });

    const subject = name?.trim() 
      ? `¡Te damos la bienvenida a Tracker UTN Sistemas, ${name.trim()}!`
      : '¡Te damos la bienvenida a Tracker UTN Sistemas!';

    const response = await resend.emails.send({
      from,
      to: [effectiveRecipient],
      subject,
      html,
      text
    });

    if (response.error) {
      console.error('[EmailService] Error de Resend al enviar bienvenida:', response.error);
      return { success: false, error: response.error.message, recipient: effectiveRecipient };
    }

    console.log(`[EmailService] ✅ Correo de bienvenida enviado con éxito a ${effectiveRecipient} (ID: ${response.data?.id})`);
    return { success: true, id: response.data?.id, recipient: effectiveRecipient };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[EmailService] Excepción al enviar bienvenida:', message);
    return { success: false, error: message, recipient: effectiveRecipient };
  }
}

/**
 * Envía el recordatorio 7 días antes de la mesa de examen asignada
 */
export async function sendExamReminderEmail(params: ExamReminderEmailParams): Promise<EmailResult> {
  const resend = getResendClient();
  const effectiveRecipient = resolveRecipient(params.to);

  if (!resend) {
    const errorMsg = 'RESEND_API_KEY no está configurada en las variables de entorno.';
    if (!process.env.VITEST) {
      console.warn(`[EmailService] ${errorMsg} (Simulación de recordatorio a ${effectiveRecipient})`);
    }
    return { success: false, error: errorMsg, recipient: effectiveRecipient };
  }

  try {
    const from = getFromEmail();
    const html = renderExamReminderEmailHtml({ ...params, to: effectiveRecipient });
    const text = renderExamReminderEmailText({ ...params, to: effectiveRecipient });

    const subject = `⏰ Faltan ${params.diasFaltantes ?? 7} días: Recordá anotarte al examen de ${params.subjectName}`;

    const response = await resend.emails.send({
      from,
      to: [effectiveRecipient],
      subject,
      html,
      text
    });

    if (response.error) {
      console.error('[EmailService] Error de Resend al enviar recordatorio:', response.error);
      return { success: false, error: response.error.message, recipient: effectiveRecipient };
    }

    console.log(`[EmailService] ✅ Recordatorio de examen enviado a ${effectiveRecipient} para ${params.subjectName} (ID: ${response.data?.id})`);
    return { success: true, id: response.data?.id, recipient: effectiveRecipient };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[EmailService] Excepción al enviar recordatorio:', message);
    return { success: false, error: message, recipient: effectiveRecipient };
  }
}
