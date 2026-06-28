const { defineConfig, devices } = require('@playwright/test');

const testPort = 3100;
const testServerUrl = `http://127.0.0.1:${testPort}`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: testServerUrl,
    trace: 'on-first-retry',
  },
  webServer: {
    command: process.env.CI
      ? `npm run start -- -p ${testPort} -H 127.0.0.1`
      : `npm run dev -- -p ${testPort} -H 127.0.0.1`,
    url: testServerUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
