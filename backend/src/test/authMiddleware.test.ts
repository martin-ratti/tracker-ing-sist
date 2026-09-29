import { describe, it, expect, vi } from 'vitest';
import { Response } from 'express';
import {
  optionalAuthMiddleware,
  requireAuthMiddleware,
  AuthenticatedRequest
} from '../auth/authMiddleware.js';
import { signToken } from '../auth/jwtService.js';

describe('authMiddleware', () => {
  it('optionalAuthMiddleware: sin header de autorización debe continuar como anónimo', () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    optionalAuthMiddleware(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('optionalAuthMiddleware: con token inválido debe continuar sin arrojar error', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    optionalAuthMiddleware(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('optionalAuthMiddleware: con token válido debe asignar req.user', () => {
    const token = signToken({ userId: 'u1', email: 'test@utn.edu.ar' });
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    optionalAuthMiddleware(req, res, next);

    expect(req.user?.userId).toBe('u1');
    expect(req.user?.email).toBe('test@utn.edu.ar');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('requireAuthMiddleware: debe rechazar con 401 si no hay token', () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const statusFn = vi.fn().mockReturnThis();
    const jsonFn = vi.fn();
    const res = { status: statusFn, json: jsonFn } as unknown as Response;
    const next = vi.fn();

    requireAuthMiddleware(req, res, next);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(jsonFn).toHaveBeenCalledWith({ error: 'Token de autenticación requerido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('requireAuthMiddleware: debe rechazar con 401 si el token es inválido', () => {
    const req = { headers: { authorization: 'Bearer falso' } } as AuthenticatedRequest;
    const statusFn = vi.fn().mockReturnThis();
    const jsonFn = vi.fn();
    const res = { status: statusFn, json: jsonFn } as unknown as Response;
    const next = vi.fn();

    requireAuthMiddleware(req, res, next);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(jsonFn).toHaveBeenCalledWith({ error: 'Token inválido o expirado.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('requireAuthMiddleware: debe invocar next() si el token es válido', () => {
    const token = signToken({ userId: 'u2', email: 'valido@utn.edu.ar' });
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    requireAuthMiddleware(req, res, next);

    expect(req.user?.userId).toBe('u2');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
