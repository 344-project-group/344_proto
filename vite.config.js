import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import 'dotenv/config'

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	server : {
		port: parseInt(process.env.PORT || '5173'),
	}
});