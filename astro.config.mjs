// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://tekiti.com',
  output: 'server',

  adapter: vercel(),

  integrations: [sitemap()]
});