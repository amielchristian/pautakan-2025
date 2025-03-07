import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        // Main process entry file
        entry: resolve(__dirname, 'electron/main.ts'),
        vite: {
          build: {
            outDir: 'dist-electron',
            minify: false,
            sourcemap: true,
            rollupOptions: {
              external: [
                'electron', 
                'node:path', 
                'node:url', 
                'node:fs',
                'path',
                'url',
                'fs',
                'sqlite3'
              ],
            },
          },
        },
      },
      {
        // Preload file - now using .cjs
        entry: resolve(__dirname, 'electron/preload.cjs'),
        vite: {
          build: {
            outDir: 'dist-electron',
            minify: false,
            sourcemap: true,
          },
        },
      },
    ]),
    renderer(),
  ],
  build: {
    emptyOutDir: false,
  },
  server: {
    host: '127.0.0.1',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});