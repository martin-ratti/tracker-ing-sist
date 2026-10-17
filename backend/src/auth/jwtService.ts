import jwt from 'jsonwebtoken';

export function getJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET debe estar configurado obligatoriamente en las variables de entorno en producción.');
  }
  return 'tracker-utn-dev-secret-change-in-prod';
}

const JWT_EXPIRES_IN = '30d';

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded === 'string') throw new Error('TOKEN_INVALID');
  return decoded as JwtPayload;
}
