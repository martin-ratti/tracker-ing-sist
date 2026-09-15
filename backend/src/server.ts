import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

// Middleware de errores global — captura cualquier excepción no tratada
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error no tratado]', err.message, err.stack);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de Tracker UTN corriendo en http://localhost:${PORT}`);
});
