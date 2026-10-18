import { describe, it, expect, beforeEach } from 'vitest';
import { resolveRecipient, getFromEmail, sendWelcomeEmail, sendExamReminderEmail } from '../services/emailService.js';
import { renderWelcomeEmailHtml, renderWelcomeEmailText } from '../services/templates/welcomeEmail.js';
import { renderExamReminderEmailHtml, renderExamReminderEmailText } from '../services/templates/examReminderEmail.js';

describe('Email Service & Templates', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  describe('resolveRecipient', () => {
    it('debe devolver el correo original si no hay EMAIL_OVERRIDE_TO', () => {
      delete process.env.EMAIL_OVERRIDE_TO;
      expect(resolveRecipient('alumno@frro.utn.edu.ar')).toBe('alumno@frro.utn.edu.ar');
    });

    it('debe redirigir a EMAIL_OVERRIDE_TO si está definido', () => {
      process.env.EMAIL_OVERRIDE_TO = 'martinratti10@gmail.com';
      expect(resolveRecipient('alumno@frro.utn.edu.ar')).toBe('martinratti10@gmail.com');
    });
  });

  describe('getFromEmail', () => {
    it('debe devolver el remitente por defecto si no está definido en env', () => {
      delete process.env.RESEND_FROM;
      expect(getFromEmail()).toContain('onboarding@resend.dev');
    });

    it('debe respetar RESEND_FROM si está configurado', () => {
      process.env.RESEND_FROM = 'Tracker <hola@midominio.com>';
      expect(getFromEmail()).toBe('Tracker <hola@midominio.com>');
    });
  });

  describe('Welcome Email Templates', () => {
    it('renderiza correctamente el HTML de bienvenida con nombre', () => {
      const html = renderWelcomeEmailHtml({
        to: 'martin@ejemplo.com',
        name: 'Martín',
        appUrl: 'https://utn-sistemas-frro.web.app'
      });

      expect(html).toContain('Martín');
      expect(html).toContain('Tracker ISI');
      expect(html).toContain('Malla Interactiva');
      expect(html).toContain('https://utn-sistemas-frro.web.app');
    });

    it('renderiza texto plano de bienvenida de respaldo', () => {
      const text = renderWelcomeEmailText({
        to: 'martin@ejemplo.com',
        name: 'Martín'
      });

      expect(text).toContain('¡Hola, Martín!');
      expect(text).toContain('Plan 2023');
    });
  });

  describe('Exam Reminder Email Templates', () => {
    it('renderiza correctamente el HTML de recordatorio 7 días antes', () => {
      const html = renderExamReminderEmailHtml({
        to: 'martin@ejemplo.com',
        studentName: 'Martín',
        subjectName: 'Sistemas Operativos',
        examDate: 'Martes 24 de Noviembre, 18:00 hs',
        turnoNombre: 'Turno Noviembre/Diciembre',
        llamado: 1,
        diasFaltantes: 7
      });

      expect(html).toContain('Sistemas Operativos');
      expect(html).toContain('Faltan 7 días');
      expect(html).toContain('Sysacad');
      expect(html).toContain('Turno Noviembre/Diciembre');
    });

    it('renderiza texto plano de recordatorio', () => {
      const text = renderExamReminderEmailText({
        to: 'martin@ejemplo.com',
        studentName: 'Martín',
        subjectName: 'Sistemas Operativos',
        examDate: '24/11/2026',
        turnoNombre: 'Turno Diciembre'
      });

      expect(text).toContain('RECORDATORIO DE EXAMEN FINAL');
      expect(text).toContain('Sistemas Operativos');
    });
  });

  describe('Simulación y fallback sin API Key', () => {
    it('maneja la ausencia de RESEND_API_KEY grácilmente', async () => {
      delete process.env.RESEND_API_KEY;

      const res = await sendWelcomeEmail({ to: 'alumno@ejemplo.com' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('RESEND_API_KEY no está configurada');
    });

    it('maneja recordatorio sin RESEND_API_KEY grácilmente', async () => {
      delete process.env.RESEND_API_KEY;

      const res = await sendExamReminderEmail({
        to: 'alumno@ejemplo.com',
        subjectName: 'Física I',
        examDate: '01/12/2026',
        turnoNombre: 'Diciembre'
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('RESEND_API_KEY no está configurada');
    });
  });
});
