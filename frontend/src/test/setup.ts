import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Limpieza automática del DOM después de cada test
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock global de fetch para evitar ERR_INVALID_URL en jsdom
globalThis.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({}),
  })
);

// Silenciar warnings de actualización fuera de act provenientes de renders iniciales
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('was not wrapped in act')) {
    return;
  }
  originalConsoleError(...args);
};

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock de ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock de window.scrollTo
window.scrollTo = () => {};

// Mock de servicios de Firebase para tests unitarios y de integración
vi.mock('../services/firebase', () => ({
  isFirebaseConfigured: true,
  signInWithGoogle: vi.fn().mockResolvedValue({
    uid: 'google-uid-123',
    email: 'alumno@google.com',
    getIdToken: vi.fn().mockResolvedValue('token-google-123'),
  }),
  signInWithEmail: vi.fn().mockImplementation((email: string) =>
    Promise.resolve({
      uid: 'fb-user-123',
      email,
      getIdToken: vi.fn().mockResolvedValue('token-email-123'),
    })
  ),
  signUpWithEmail: vi.fn().mockImplementation((email: string) =>
    Promise.resolve({
      uid: 'fb-user-nuevo',
      email,
      getIdToken: vi.fn().mockResolvedValue('token-email-nuevo'),
    })
  ),
  signOutFirebase: vi.fn().mockResolvedValue(undefined),
  onFirebaseAuthStateChanged: vi.fn().mockImplementation((_cb: (user: unknown) => void) => () => {}),
  saveProgressToFirestore: vi.fn().mockResolvedValue(undefined),
  fetchProgressFromFirestore: vi.fn().mockResolvedValue(null),
  subscribeToUserProgress: vi.fn().mockImplementation((_uid: string, _cb: unknown) => () => {}),
  auth: null,
  db: null,
  analytics: null,
  googleProvider: null,
}));

