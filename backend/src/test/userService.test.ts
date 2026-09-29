import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  registerUser,
  loginUser,
  getUserById,
  getUserProgressPath
} from '../auth/userService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

describe('userService', () => {
  beforeEach(() => {
    // Resetear archivo de usuarios para pruebas limpias
    if (fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }), 'utf-8');
    }
  });

  it('debe registrar un nuevo usuario con contraseña hasheada y normalización de email', async () => {
    const user = await registerUser('  Alumno@UTN.edu.ar ', 'password123');

    expect(user.id).toBeDefined();
    expect(user.email).toBe('alumno@utn.edu.ar');
    expect(user.passwordHash).not.toBe('password123');
    expect(user.createdAt).toBeDefined();

    const retrieved = getUserById(user.id);
    expect(retrieved?.email).toBe('alumno@utn.edu.ar');
  });

  it('debe lanzar EMAIL_IN_USE si el email ya existe', async () => {
    await registerUser('duplicado@utn.edu.ar', 'secreto123');

    await expect(registerUser('DUPLICADO@utn.edu.ar', 'otraPassword')).rejects.toThrow('EMAIL_IN_USE');
  });

  it('debe autenticar exitosamente con credenciales correctas', async () => {
    await registerUser('login@utn.edu.ar', 'claveSegura123');

    const user = await loginUser('LOGIN@utn.edu.ar', 'claveSegura123');
    expect(user.email).toBe('login@utn.edu.ar');
  });

  it('debe lanzar INVALID_CREDENTIALS si el usuario no existe o la clave es incorrecta', async () => {
    await registerUser('existente@utn.edu.ar', 'claveCorrecta');

    await expect(loginUser('inexistente@utn.edu.ar', 'claveCorrecta')).rejects.toThrow('INVALID_CREDENTIALS');
    await expect(loginUser('existente@utn.edu.ar', 'claveErronea')).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('debe generar la ruta correcta para el progreso del usuario', () => {
    const filePath = getUserProgressPath('user-xyz-123');
    expect(filePath).toContain('user-xyz-123.json');
  });
});
