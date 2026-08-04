import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
//
// `base` is the public path the built assets are served from. On GitHub Pages a
// project site lives at https://<user>.github.io/em-quem-votar/, so production
// builds must reference assets under "/em-quem-votar/". Local dev keeps "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/em-quem-votar/' : '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
}));
