import path from 'path';
import dotenv from 'dotenv';

// Cargar variables desde la raíz del proyecto y backend
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { sendWelcomeEmail, sendExamReminderEmail } from '../services/emailService.js';

async function main() {
  const targetEmail = process.env.EMAIL_OVERRIDE_TO || 'martinratti10@gmail.com';
  console.log('====================================================');
  console.log('🚀 INICIANDO PRUEBA DE ENVÍO DE CORREOS CON RESEND');
  console.log(`Destinatario de revisión: ${targetEmail}`);
  console.log('====================================================\n');

  // 1. Probar Correo de Bienvenida
  console.log('1️⃣ Enviando correo de bienvenida formateado...');
  const welcomeRes = await sendWelcomeEmail({
    to: targetEmail,
    name: 'Martín',
    appUrl: 'https://utn-sistemas-frro.web.app'
  });

  if (welcomeRes.success) {
    console.log(`✅ Mail de bienvenida enviado exitosamente. ID: ${welcomeRes.id}\n`);
  } else {
    console.error(`❌ Falló el envío de bienvenida: ${welcomeRes.error}\n`);
  }

  // Esperar 1 segundo entre envíos para respetar rate limits de Resend en cuenta nueva
  await new Promise(r => setTimeout(r, 1200));

  // 2. Probar Recordatorio de Mesa 7 días antes
  console.log('2️⃣ Enviando correo de recordatorio de mesa (7 días antes)...');
  const reminderRes = await sendExamReminderEmail({
    to: targetEmail,
    studentName: 'Martín',
    subjectName: 'Sistemas Operativos',
    examDate: 'Martes 24 de Noviembre, 18:00 hs',
    turnoNombre: 'Turno Noviembre/Diciembre',
    llamado: 1,
    diasFaltantes: 7,
    sysacadUrl: 'https://alumnos.frro.utn.edu.ar/loginAlumno.asp?refrescar',
    appUrl: 'https://utn-sistemas-frro.web.app'
  });

  if (reminderRes.success) {
    console.log(`✅ Mail de recordatorio enviado exitosamente. ID: ${reminderRes.id}\n`);
  } else {
    console.error(`❌ Falló el envío de recordatorio: ${reminderRes.error}\n`);
  }

  console.log('====================================================');
  console.log('🏁 Proceso finalizado. Por favor revisá tu casilla en:');
  console.log(`👉 ${targetEmail} (incluyendo la carpeta de Spam/Promociones si es la primera vez)`);
  console.log('====================================================');
}

main().catch(err => {
  console.error('Error fatal al ejecutar script de prueba de emails:', err);
  process.exit(1);
});
