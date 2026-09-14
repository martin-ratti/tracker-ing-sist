import { Router, Request, Response } from 'express';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS } from '../data/plan2023.js';
import { getProgress, saveProgress, resetProgress } from '../storage/progressStore.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

apiRouter.get('/progress', (_req: Request, res: Response) => {
  const progress = getProgress();
  res.json(progress);
});

apiRouter.post('/progress', (req: Request, res: Response) => {
  const { estados, estadosElectivas, notas, ppsHoras } = req.body;
  const updated = saveProgress({
    ...(estados !== undefined && { estados }),
    ...(estadosElectivas !== undefined && { estadosElectivas }),
    ...(notas !== undefined && { notas }),
    ...(ppsHoras !== undefined && { ppsHoras })
  });
  res.json({ success: true, data: updated });
});

apiRouter.post('/progress/reset', (_req: Request, res: Response) => {
  const reset = resetProgress();
  res.json({ success: true, data: reset });
});
