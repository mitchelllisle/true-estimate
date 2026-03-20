import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	resolve: {
		alias: {
			$lib: resolve(__dirname, './src/lib')
		},
		conditions: ['browser']
	},
	test: {
		include: ['src/tests/**/*.test.ts'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['src/tests/setup.ts']
	}
});
