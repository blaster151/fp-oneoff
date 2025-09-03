import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.test.ts',
      'src/**/__tests__/**/*.test.ts',
      'tests/**/*.test.ts'
    ],
    exclude: [
      'node_modules',
      'dist',
      'build'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/**/*.test.ts',
        'src/**/__tests__/**',
        'tests/',
        'scripts/',
        'examples/'
      ]
    }
  },
  resolve: {
    alias: {
      // Ensure .js extensions are resolved correctly for ESM
      '@': '/src'
    }
  }
});