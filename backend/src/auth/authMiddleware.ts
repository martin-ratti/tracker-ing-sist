import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from './jwtService.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
  } catch {
    // Si el token es inválido o expiró, continuamos como anónimo
  }
  next();
}

export function requireAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticación requerido.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}
