// Sandbox UI dev server. Proxies /api to the sandbox server (default :3100).
//
// Testing unpublished @rnsk/bot changes: point RNSK_BOT_SOURCE at the bot's src folder
// (run `npm install` inside that bot package once), e.g.
//   RNSK_BOT_SOURCE=/path/to/Runstack/@rnsk/bot/src npm run sandbox

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const botSource = process.env.RNSK_BOT_SOURCE ? path.resolve(process.env.RNSK_BOT_SOURCE) : null;

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: botSource
      ? [
          { find: /^@rnsk\/bot$/, replacement: path.join(botSource, 'index.ts') },
          {
            find: /^@rnsk\/bot\/styles\/bot\.css$/,
            replacement: path.join(botSource, '..', 'styles', 'bot.css'),
          },
        ]
      : [],
    // One copy of React / AI SDK even when the bot is aliased to another folder.
    dedupe: ['react', 'react-dom', 'ai', '@ai-sdk/react'],
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: `http://127.0.0.1:${process.env.PORT ?? 3100}` },
    },
  },
});
