import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    // La suite completa satura la CPU en WSL: al ejecutar los 13 archivos en
    // paralelo, el primer beforeEach supera el timeout por defecto de 10 s.
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 20_000,
  },
});
