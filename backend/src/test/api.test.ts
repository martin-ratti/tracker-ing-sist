import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

describe('API REST Integration Tests', () => {
  beforeEach(() => {
    if (fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }), 'utf-8');
    }
  });

  describe('GET /api/health', () => {
    it('debe responder 200 con status ok y timestamp', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });

    it('el middleware de error global debe responder 500 ante excepciones no capturadas', () => {
      const errorMiddleware = (app as any)._router?.stack?.find((s: any) => s.handle?.length === 4)?.handle;
      if (errorMiddleware) {
        const statusFn = vi.fn().mockReturnThis();
        const jsonFn = vi.fn();
        const res = { status: statusFn, json: jsonFn } as any;
        errorMiddleware(new Error('Error de prueba'), {} as any, res, () => {});
        expect(statusFn).toHaveBeenCalledWith(500);
        expect(jsonFn).toHaveBeenCalledWith({ error: 'Error interno del servidor.' });
      }
    });
  });

  describe('GET /api/plan', () => {
    it('debe responder 200 con las materias troncales, electivas y requisitos de títulos', async () => {
      const res = await request(app).get('/api/plan');
      expect(res.status).toBe(200);
      expect(res.body.carrera).toBe('Ingeniería en Sistemas de Información');
      expect(res.body.materiasTroncales).toHaveLength(37);
      expect(res.body.titulos.adusi).toBeDefined();
      expect(res.body.titulos.ingenieria).toBeDefined();
    });
  });

  describe('Autenticación y Registro (/api/auth)', () => {
    it('debe rechazar registro con email inválido o contraseña corta', async () => {
      const badEmail = await request(app)
        .post('/api/auth/register')
        .send({ email: 'no-es-un-email', password: 'password123' });
      expect(badEmail.status).toBe(400);

      const shortPass = await request(app)
        .post('/api/auth/register')
        .send({ email: 'valido@utn.edu.ar', password: '123' });
      expect(shortPass.status).toBe(400);
    });

    it('debe registrar un usuario, iniciar sesión y obtener datos en /api/auth/me', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ email: 'estudiante@frro.utn.edu.ar', password: 'claveSegura123' });

      expect(regRes.status).toBe(201);
      expect(regRes.body.token).toBeDefined();
      expect(regRes.body.user.email).toBe('estudiante@frro.utn.edu.ar');

      // Intentar registrar el mismo email -> 409
      const dupRes = await request(app)
        .post('/api/auth/register')
        .send({ email: 'estudiante@frro.utn.edu.ar', password: 'claveSegura123' });
      expect(dupRes.status).toBe(409);

      // Iniciar sesión
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'estudiante@frro.utn.edu.ar', password: 'claveSegura123' });
      expect(loginRes.status).toBe(200);
      const token = loginRes.body.token;

      // Obtener /api/auth/me
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe('estudiante@frro.utn.edu.ar');
    });

    it('debe rechazar login con credenciales erróneas o faltantes', async () => {
      const missing = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@utn.edu.ar' });
      expect(missing.status).toBe(400);

      const invalid = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noexiste@utn.edu.ar', password: 'wrong' });
      expect(invalid.status).toBe(401);
    });

    it('debe rechazar /api/auth/me sin token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Progreso de Usuario (/api/progress)', () => {
    it('debe devolver progreso anónimo por defecto', async () => {
      const res = await request(app).get('/api/progress');
      expect(res.status).toBe(200);
      expect(res.body.estados).toBeDefined();
    });

    it('debe validar tipos incorrectos al guardar progreso', async () => {
      const badEstados = await request(app)
        .post('/api/progress')
        .send({ estados: 'invalido-no-objeto' });
      expect(badEstados.status).toBe(400);

      const badPps = await request(app)
        .post('/api/progress')
        .send({ ppsHoras: 'no-es-numero' });
      expect(badPps.status).toBe(400);

      const badPerfil = await request(app)
        .post('/api/progress')
        .send({ perfil: 'invalido' });
      expect(badPerfil.status).toBe(400);

      const badElectivas = await request(app)
        .post('/api/progress')
        .send({ estadosElectivas: 'invalido' });
      expect(badElectivas.status).toBe(400);

      const badNotas = await request(app)
        .post('/api/progress')
        .send({ notas: 'invalido' });
      expect(badNotas.status).toBe(400);

      const badMetas = await request(app)
        .post('/api/progress')
        .send({ metasExamen: 'invalido' });
      expect(badMetas.status).toBe(400);
    });

    it('debe permitir guardar progreso y luego resetearlo para usuario anónimo y autenticado', async () => {
      // Registro de usuario
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ email: 'autenticado@utn.edu.ar', password: 'claveSegura123' });
      const token = reg.body.token;

      // Guardar anónimo
      const saveRes = await request(app)
        .post('/api/progress')
        .send({
          estados: { 1: 'aprobada', 2: 'regular' },
          estadosElectivas: { 201: 'cursando' },
          notas: { 1: { nota: 8 } },
          ppsHoras: 150,
          perfil: { nombre: 'Juan Alumno', legajo: '12345' },
          metasExamen: { 1: { materiaId: 1, turnoId: 't1' } }
        });
      expect(saveRes.status).toBe(200);
      expect(saveRes.body.success).toBe(true);
      expect(saveRes.body.data.estados[1]).toBe('aprobada');
      expect(saveRes.body.data.perfil.nombre).toBe('Juan Alumno');

      // Guardar autenticado con token
      const saveAuthRes = await request(app)
        .post('/api/progress')
        .set('Authorization', `Bearer ${token}`)
        .send({
          estados: { 3: 'aprobada' },
          ppsHoras: 200
        });
      expect(saveAuthRes.status).toBe(200);
      expect(saveAuthRes.body.data.estados[3]).toBe('aprobada');

      // Leer progreso autenticado
      const getAuthRes = await request(app)
        .get('/api/progress')
        .set('Authorization', `Bearer ${token}`);
      expect(getAuthRes.status).toBe(200);
      expect(getAuthRes.body.estados[3]).toBe('aprobada');

      // Resetear autenticado
      const resetAuthRes = await request(app)
        .post('/api/progress/reset')
        .set('Authorization', `Bearer ${token}`);
      expect(resetAuthRes.status).toBe(200);
      expect(resetAuthRes.body.data.estados).toEqual({});

      // Resetear anónimo
      const resetRes = await request(app).post('/api/progress/reset');
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.data.estados).toEqual({});
      expect(resetRes.body.data.ppsHoras).toBe(0);
    });
  });
});
