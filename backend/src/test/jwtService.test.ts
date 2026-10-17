import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signToken, verifyToken, getJwtSecret } from '../auth/jwtService.js';

describe('jwtService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('debe firmar y verificar un token JWT válido', () => {
    const payload = { userId: 'user-123', email: 'test@utn.edu.ar' };
    const token = signToken(payload);

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('user-123');
    expect(decoded.email).toBe('test@utn.edu.ar');
  });

  it('debe usar JWT_SECRET de las variables de entorno si está presente', () => {
    process.env.JWT_SECRET = 'secreto-custom-seguro-123';
    expect(getJwtSecret()).toBe('secreto-custom-seguro-123');
  });

  it('debe lanzar error en producción si JWT_SECRET no está configurado', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    expect(() => getJwtSecret()).toThrow('JWT_SECRET debe estar configurado');
  });

  it('debe fallar al verificar un token alterado o inválido', () => {
    expect(() => verifyToken('token.invalido.falso')).toThrow();
  });

  it('debe lanzar TOKEN_INVALID si el payload decodificado es un string primitivo', async () => {
    const jwt = await import('jsonwebtoken');
    const secret = getJwtSecret();
    const stringToken = jwt.default.sign('payload-string-plano', secret);
    expect(() => verifyToken(stringToken)).toThrow('TOKEN_INVALID');
  });
});
