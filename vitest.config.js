import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{js,ts}'],
    exclude: ['e2e/**', 'node_modules/**']
  }
});
