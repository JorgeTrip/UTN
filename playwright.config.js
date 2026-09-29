import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de pruebas end-to-end con Playwright.
 * Levanta un servidor web local estático en el puerto 8080 para permitir
 * la carga de los archivos JSON mediante fetch sin bloqueos de origen local.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: 'python -m http.server 8080',
    port: 8080,
    reuseExistingServer: true,
    timeout: 15000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
