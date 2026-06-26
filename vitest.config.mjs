import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['js/**/*.test.js', 'js/**/*.spec.js'],
    exclude: ['node_modules/', 'dist/'],
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
