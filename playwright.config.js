import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/superhero-mini/',
    trace: 'retain-on-failure',
  },
  projects: [{
    name: 'chrome',
    use: { ...devices['Desktop Chrome'], channel: 'chrome' },
  }],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173/superhero-mini/',
      env: { VITE_SUPERHERO_API_TOKEN: 'test-token-not-a-credential' },
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4174 --strictPort',
      url: 'http://127.0.0.1:4174/superhero-mini/',
      env: { VITE_SUPERHERO_API_TOKEN: '' },
      reuseExistingServer: false,
    },
  ],
})
