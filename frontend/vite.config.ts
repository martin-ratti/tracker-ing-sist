/// <reference types="vitest/config" />
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function pwaPrecacheManifestPlugin(): Plugin {
  return {
    name: 'pwa-precache-manifest',
    apply: 'build',
    writeBundle(options, bundle) {
      const outDir = options.dir || path.resolve(process.cwd(), 'dist');
      const assetUrls: string[] = [];
      for (const fileName of Object.keys(bundle)) {
        if (/\.(js|css|svg|png|webmanifest)$/i.test(fileName) && !fileName.endsWith('.map')) {
          assetUrls.push(`/${fileName.replace(/\\/g, '/')}`);
        }
      }
      fs.writeFileSync(
        path.join(outDir, 'sw-assets.json'),
        JSON.stringify(assetUrls, null, 2),
        'utf-8'
      );
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pwaPrecacheManifestPlugin()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/types/**',
        'src/**/index.ts',
        'src/services/firebase.ts',
        'src/data/calendario/types.ts'
      ]
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/vis-network') || id.includes('node_modules/vis-data')) {
            return 'vendor-vis';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        }
      }
    }
  }
});
