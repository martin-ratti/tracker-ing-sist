import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS } from '../data/plan2023.js';
import { getProgress, saveProgress } from '../storage/progressStore.js';
import { getUserById } from '../auth/userService.js';
import { sendExamReminderEmail } from './emailService.js';
import type { MetaExamen } from '../types/plan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROGRESS_DIR = path.join(__dirname, '../../data/progress');

const MATERIA_NAMES_MAP = new Map<number, string>();
[...MATERIAS_TRONCALES, ...MATERIAS_ELECTIVAS].forEach(m => {
  const fullName = 'nombreCompleto' in m && m.nombreCompleto ? m.nombreCompleto : m.nombre;
  MATERIA_NAMES_MAP.set(m.id, fullName);
});

export interface ReminderExecutionReport {
  checkedUsers: number;
  sentReminders: number;
  details: Array<{
    userId: string;
    email: string;
    materiaNombre: string;
    fechaExamen: string;
    diasFaltantes: number;
  }>;
}

/**
 * Calcula la diferencia en días enteros entre una fecha YYYY-MM-DD y una fecha de referencia
 */
export function calculateDaysRemaining(targetDateStr: string, referenceDate: Date = new Date()): number {
  const [year, month, day] = targetDateStr.split('-').map(Number);
  if (!year || !month || !day) return NaN;

  const target = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const ref = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 12, 0, 0));

  const diffMs = target.getTime() - ref.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formatea una fecha YYYY-MM-DD a formato amigable en español (ej. "Martes 24 de Noviembre")
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(n => isNaN(n) || n <= 0)) {
      return dateStr;
    }
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Revisa todas las metas de exámenes guardadas y envía recordatorio 7 días antes
 */
export async function checkAndSendDueReminders(referenceDate: Date = new Date()): Promise<ReminderExecutionReport> {
  const report: ReminderExecutionReport = {
    checkedUsers: 0,
    sentReminders: 0,
    details: []
  };

  if (!fs.existsSync(PROGRESS_DIR)) {
    return report;
  }

  const files = fs.readdirSync(PROGRESS_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const userId = file.replace('.json', '');
    const user = getUserById(userId);
    const progress = getProgress(userId);

    report.checkedUsers++;

    if (!progress.metasExamen || Object.keys(progress.metasExamen).length === 0) {
      continue;
    }

    const email = user?.email || process.env.EMAIL_OVERRIDE_TO || 'martinratti10@gmail.com';
    const studentName = progress.perfil?.nombre || user?.email?.split('@')[0] || 'Estudiante';
    let progressChanged = false;

    const metas = { ...progress.metasExamen };

    for (const [materiaIdStr, meta] of Object.entries(metas)) {
      const materiaId = Number(materiaIdStr);
      if (!meta.fechaEstimada) continue;

      const diffDays = calculateDaysRemaining(meta.fechaEstimada, referenceDate);

      // Enviamos el recordatorio si faltan exactamente 7 días (o si está entre 5 y 7 días y aún no se notificó)
      if (diffDays <= 7 && diffDays >= 5 && !meta.notificado7Dias) {
        const subjectName = MATERIA_NAMES_MAP.get(materiaId) || `Materia #${materiaId}`;
        const friendlyDate = formatFriendlyDate(meta.fechaEstimada);

        console.log(`[ReminderService] Enviando recordatorio a ${email} para "${subjectName}" (Faltan ${diffDays} días)...`);

        const sendResult = await sendExamReminderEmail({
          to: email,
          studentName,
          subjectName,
          examDate: friendlyDate,
          turnoNombre: meta.turnoNombre || 'Mesa de Examen Oficial',
          llamado: meta.llamado,
          diasFaltantes: diffDays
        });

        if (sendResult.success) {
          const updatedMeta: MetaExamen = {
            ...meta,
            notificado7Dias: true
          };
          metas[materiaId] = updatedMeta;
          progressChanged = true;
          report.sentReminders++;

          report.details.push({
            userId,
            email,
            materiaNombre: subjectName,
            fechaExamen: friendlyDate,
            diasFaltantes: diffDays
          });
        }
      }
    }

    if (progressChanged) {
      saveProgress({ metasExamen: metas }, userId);
    }
  }

  return report;
}

let scheduledInterval: NodeJS.Timeout | null = null;

/**
 * Inicia el cron / temporizador para revisar recordatorios una vez al día
 */
export function startReminderScheduler(): void {
  if (scheduledInterval) return;

  // Ejecución inicial después de 5 segundos de levantar el servidor
  setTimeout(() => {
    checkAndSendDueReminders().catch(err => {
      console.error('[ReminderScheduler] Error en chequeo inicial de recordatorios:', err);
    });
  }, 5000);

  // Intervalo cada 24 horas (24 * 60 * 60 * 1000 ms)
  scheduledInterval = setInterval(() => {
    checkAndSendDueReminders().catch(err => {
      console.error('[ReminderScheduler] Error en chequeo diario de recordatorios:', err);
    });
  }, 24 * 60 * 60 * 1000);

  // Evitar que el timer impida cerrar Node limpiamente
  scheduledInterval.unref();
}

export function stopReminderScheduler(): void {
  if (scheduledInterval) {
    clearInterval(scheduledInterval);
    scheduledInterval = null;
  }
}
