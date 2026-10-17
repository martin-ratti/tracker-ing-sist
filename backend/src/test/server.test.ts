import { describe, it, expect, vi } from 'vitest';
import { app, startServer } from '../server.js';

describe('server startup', () => {
  it('debe iniciar el servidor llamando a app.listen', () => {
    const listenSpy = vi.spyOn(app, 'listen').mockImplementation((_port, cb) => {
      if (typeof cb === 'function') cb();
      return {} as any;
    });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    startServer(3002);

    expect(listenSpy).toHaveBeenCalledWith(3002, expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('3002'));

    listenSpy.mockRestore();
    logSpy.mockRestore();
  });
});
