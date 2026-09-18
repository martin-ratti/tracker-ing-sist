import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROGRESS_DIR = path.join(DATA_DIR, 'progress');

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface UsersStore {
  users: UserRecord[];
}

function ensureDirs(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR, { recursive: true });
}

function readUsersStore(): UsersStore {
  ensureDirs();
  if (!fs.existsSync(USERS_FILE)) return { users: [] };
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return { users: [] };
  }
}

function writeUsersStore(store: UsersStore): void {
  ensureDirs();
  fs.writeFileSync(USERS_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getUserProgressPath(userId: string): string {
  ensureDirs();
  return path.join(PROGRESS_DIR, `${userId}.json`);
}

export async function registerUser(email: string, password: string): Promise<UserRecord> {
  const store = readUsersStore();
  const normalEmail = email.toLowerCase().trim();

  if (store.users.some(u => u.email === normalEmail)) {
    throw new Error('EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newUser: UserRecord = {
    id: generateId(),
    email: normalEmail,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);
  writeUsersStore(store);
  return newUser;
}

export async function loginUser(email: string, password: string): Promise<UserRecord> {
  const store = readUsersStore();
  const normalEmail = email.toLowerCase().trim();
  const user = store.users.find(u => u.email === normalEmail);

  if (!user) throw new Error('INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  return user;
}

export function getUserById(id: string): UserRecord | null {
  const store = readUsersStore();
  return store.users.find(u => u.id === id) ?? null;
}
