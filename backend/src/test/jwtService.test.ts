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
});
