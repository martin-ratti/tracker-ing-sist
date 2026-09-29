import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { createRateLimiter } from '../middleware/rateLimiter.js';

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
});
