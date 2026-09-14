// Toolkit sandbox server. Start it with `npm run sandbox` from the repo root (see sandbox/README.md).
//
//   routes/toolkits.ts    toolkit/tool inspection + direct execution (Tool runner)
//   routes/credentials.ts in-memory tokens / service env
//   routes/bot.ts         the Runstack bot API, so @rnsk/bot can chat with local toolkits
//   toolkits-source.ts    feature flag: local source vs published npm package

import { fileURLToPath } from 'node:url';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

const sandboxDir = fileURLToPath(new URL('..', import.meta.url));
dotenv.config({ path: [`${sandboxDir}.env.local`, `${sandboxDir}.env`], quiet: true } as never);

const { resolveLlm } = await import('./model.js');
const { createRuntime } = await import('./runtime.js');
const { createBotRouter } = await import('./routes/bot.js');
const { createCredentialsRouter } = await import('./routes/credentials.js');
const { createToolkitsRouter } = await import('./routes/toolkits.js');

const PORT = Number(process.env.PORT ?? 3100);
const HOST = process.env.HOST ?? '127.0.0.1';

let runtime: Awaited<ReturnType<typeof createRuntime>>;
try {
  runtime = await createRuntime();
} catch (error) {
  console.error('\n✖ Failed to load toolkits.\n');
  console.error(error);
  console.error('\nFix the error above and save; the sandbox restarts automatically.\n');
  process.exit(1);
}

const manifestErrors = runtime.api.core.validateManifests?.(runtime.api.toolkits) ?? [];
const llm = await resolveLlm();

const app = express();
// Only local pages may call the sandbox; it holds your tokens.
app.use(cors({ origin: [/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/] }));
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    bootId: runtime.bootId,
    toolkits: {
      source: runtime.api.source,
      version: runtime.api.version,
      count: runtime.api.toolkits.length,
      toolCount: runtime.registry.getToolNames().length,
      manifestErrors,
    },
    llm: llm.ok
      ? { ok: true, provider: llm.provider, modelId: llm.modelId, note: llm.note }
      : { ok: false, code: llm.code, message: llm.message, hint: llm.hint },
  });
});

app.use(createToolkitsRouter(runtime));
app.use(createCredentialsRouter(runtime));
app.use(createBotRouter(runtime, llm));

app.listen(PORT, HOST, () => {
  const { api } = runtime;
  const lines = [
    '',
    `  Toolkit sandbox API   http://${HOST}:${PORT}   (UI: http://localhost:5173)`,
    `  Toolkits              ${api.source === 'local' ? 'LOCAL packages/toolkits/src' : 'NPM @rnsk/toolkits'} v${api.version} · ${api.toolkits.length} toolkits · ${runtime.registry.getToolNames().length} tools`,
    llm.ok
      ? `  LLM                   ${llm.provider} / ${llm.modelId} (free)${llm.note ? ` — ${llm.note}` : ''}`
      : `  LLM                   off — ${llm.message}\n                        ${llm.hint}`,
  ];
  if (manifestErrors.length > 0) {
    lines.push(`  ⚠ Manifest problems (${manifestErrors.length}):`);
    for (const error of manifestErrors) lines.push(`    - ${error}`);
  }
  console.log(`${lines.join('\n')}\n`);
});
