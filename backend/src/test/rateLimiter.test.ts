import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { createRateLimiter, cleanupExpiredRecords } from '../middleware/rateLimiter.js';

describe('rateLimiter middleware', () => {
  it('debe permitir peticiones por debajo del límite', () => {
    const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 });
    const req = { ip: '127.0.0.1' } as Request;
    const res = {} as Response;
    const next = vi.fn();

    limiter(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    limiter(req, res, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('debe responder 429 cuando se excede maxRequests', () => {
    const limiter = createRateLimiter({
      windowMs: 5000,
      maxRequests: 1,
      message: 'Límite alcanzado'
    });
    const req = { ip: '192.168.1.100' } as Request;
    const setHeader = vi.fn();
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { setHeader, status, json } as unknown as Response;
    const next = vi.fn();

    // Primera petición: OK
    limiter(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Segunda petición: Bloqueada
    limiter(req, res, next);
    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Límite alcanzado' }));
  });

  it('debe usar remoteAddress o unknown-ip si req.ip no está presente', () => {
    const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 5 });
    const reqSocket = { socket: { remoteAddress: '10.0.0.1' } } as unknown as Request;
    const reqUnknown = { socket: {} } as unknown as Request;
    const next = vi.fn();

    limiter(reqSocket, {} as Response, next);
    limiter(reqUnknown, {} as Response, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('debe reiniciar el contador tras expirar la ventana de tiempo y limpiar registros', () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });
    const req = { ip: '172.16.0.1' } as Request;
    const next = vi.fn();

    limiter(req, {} as Response, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Avanzar más allá de windowMs
    vi.advanceTimersByTime(1500);

    // Debe permitirse nuevamente porque expiró
    limiter(req, {} as Response, next);
    expect(next).toHaveBeenCalledTimes(2);

    // Limpiar registros expirados directamente
    cleanupExpiredRecords(Date.now() + 10000);

    vi.useRealTimers();
  });
});
