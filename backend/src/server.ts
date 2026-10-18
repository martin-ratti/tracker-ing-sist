import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Seguridad y headers HTTP con Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Compresión gzip / deflate para respuestas API
app.use(compression());

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api', apiRouter);

// Middleware de errores global — captura cualquier excepción no tratada
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error no tratado]', err.message, err.stack);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

export function startServer(port = PORT) {
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor de Tracker UTN corriendo en http://localhost:${port}`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor grácilmente...`);
    server.close(() => {
      console.log('✅ Conexiones HTTP cerradas. Proceso finalizado.');
      process.exit(0);
    });

    // Forzar salida si tarda más de 5 segundos
    setTimeout(() => {
      console.error('⚠️ Cierre forzado por tiempo límite excedido.');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
