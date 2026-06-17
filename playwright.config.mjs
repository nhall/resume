import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: {
		baseURL: 'http://localhost:3000',
	},
	webServer: {
		command: 'node test-server.mjs',
		port: 3000,
		reuseExistingServer: true,
		timeout: 10000,
	},
	testDir: 'tests',
	testMatch: '**/*.mjs',
});
