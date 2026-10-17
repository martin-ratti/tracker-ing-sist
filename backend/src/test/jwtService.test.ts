import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../auth/jwtService.js';

describe('jwtService', () => {
  it('debe firmar y verificar un token JWT válido', () => {
    const payload = { userId: 'user-123', email: 'test@utn.edu.ar' };
    const token = signToken(payload);

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('user-123');
    expect(decoded.email).toBe('test@utn.edu.ar');
  });

  it('debe fallar al verificar un token alterado o inválido', () => {
    expect(() => verifyToken('token.invalido.falso')).toThrow();
  });

  it('debe lanzar TOKEN_INVALID si el payload decodificado es un string primitivo', async () => {
    const jwt = await import('jsonwebtoken');
    const secret = 'tracker-utn-dev-secret-change-in-prod';
    const stringToken = jwt.default.sign('payload-string-plano', secret);
    expect(() => verifyToken(stringToken)).toThrow('TOKEN_INVALID');
  });
});
