import { Router, Request, Response } from 'express';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS } from '../data/plan2023.js';
import { getProgress, saveProgress, resetProgress } from '../storage/progressStore.js';
import { registerUser, loginUser, getUserById } from '../auth/userService.js';
import { signToken } from '../auth/jwtService.js';
import { optionalAuthMiddleware, requireAuthMiddleware, AuthenticatedRequest } from '../auth/authMiddleware.js';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Plan de estudios UTN Sistemas 2023
apiRouter.get('/plan', (_req: Request, res: Response) => {
  res.json({
    carrera: 'Ingeniería en Sistemas de Información',
    facultad: 'UTN FRRo',
    plan: '2023',
    materiasTroncales: MATERIAS_TRONCALES,
    materiasElectivas: MATERIAS_ELECTIVAS,
    titulos: {
      adusi: {
        nombre: 'Analista Desarrollador Universitario en Sistemas de Información',
        requisitos: {
          nivelesCompletos: [1, 2, 3],
          requiereSeminario: true,
          horasElectivasMinimas: 4
        }
      },
      ingenieria: {
        nombre: 'Ingeniero/a en Sistemas de Información',
        requisitos: {
          todasTroncales: true,
          horasElectivasMinimas: 20,
          ppsHorasMinimas: 200
        }
      }
    }
  });
});

// --- RUTAS DE AUTENTICACIÓN ---

apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    return;
  }

  try {
    const user = await registerUser(email, password);
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error: any) {
    if (error.message === 'EMAIL_IN_USE') {
      res.status(409).json({ error: 'El correo electrónico ya se encuentra registrado.' });
      return;
    }
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al procesar el registro.' });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email y contraseña requeridos.' });
    return;
  }

  try {
    const user = await loginUser(email, password);
    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
      return;
    }
    console.error('Error al autenticar usuario:', error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

apiRouter.get('/auth/me', requireAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }
  const user = getUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado.' });
    return;
  }
  res.json({
    user: { id: user.id, email: user.email }
  });
});

// --- RUTAS DE PROGRESO (con soporte anónimo y autenticado) ---

apiRouter.get('/progress', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const progress = getProgress(userId);
  res.json(progress);
});

apiRouter.post('/progress', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { estados, estadosElectivas, notas, ppsHoras } = req.body;

  // Validación básica de tipos
  if (estados !== undefined && typeof estados !== 'object') {
    res.status(400).json({ error: 'El campo estados debe ser un objeto.' });
    return;
  }
  if (estadosElectivas !== undefined && typeof estadosElectivas !== 'object') {
    res.status(400).json({ error: 'El campo estadosElectivas debe ser un objeto.' });
    return;
  }
  if (notas !== undefined && typeof notas !== 'object') {
    res.status(400).json({ error: 'El campo notas debe ser un objeto.' });
    return;
  }
  if (ppsHoras !== undefined && typeof ppsHoras !== 'number') {
    res.status(400).json({ error: 'El campo ppsHoras debe ser un número.' });
    return;
  }

  try {
    const updated = saveProgress({
      ...(estados !== undefined && { estados }),
      ...(estadosElectivas !== undefined && { estadosElectivas }),
      ...(notas !== undefined && { notas }),
      ...(ppsHoras !== undefined && { ppsHoras })
    }, userId);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error guardando progreso:', err);
    res.status(500).json({ error: 'No se pudo guardar el progreso.' });
  }
});

apiRouter.post('/progress/reset', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const reset = resetProgress(userId);
  res.json({ success: true, data: reset });
});
