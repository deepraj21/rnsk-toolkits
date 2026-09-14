// Guards the contract between the sandbox and @rnsk/bot: meta-tool names and the output
// fields the bot UI reads (tool-pill-meta.ts, initiate-connection.tsx). Run: npm test -w sandbox

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import { simulateReadableStream } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';
import express from 'express';

import { META_TOOL_NAMES, createMetaTools } from './meta-tools.js';
import { createBotRouter } from './routes/bot.js';
import { createRuntime } from './runtime.js';

const runtime = await createRuntime();
const call = (t: unknown, input: unknown) =>
  (t as { execute: (i: unknown, o: unknown) => Promise<Record<string, unknown>> }).execute(input, {
    toolCallId: 'test',
    messages: [],
  });

const tools = createMetaTools({
  runtime,
  scope: null,
  connectUrl: (id) => `http://localhost:5173/?toolkit=${id}&connect=1`,
});

test('meta-tool names match Runstack', () => {
  assert.deepEqual(Object.keys(tools).sort(), [...META_TOOL_NAMES].sort());
});

test('executeTool success carries toolkitId', async () => {
  const out = await call(tools.executeTool, { toolName: 'calculateSum', args: { a: 1, b: 2 } });
  assert.equal(out.success, true, JSON.stringify(out));
  assert.equal(out.toolkitId, 'mathematics');
});

test('executeTool without a token carries requiredAuth', async () => {
  const out = await call(tools.executeTool, { toolName: 'listRepos', args: {} });
  assert.equal(out.requiredAuth, 'githubToken', JSON.stringify(out));
});

test('initiateConnection returns provider + link', async () => {
  const out = await call(tools.initiateConnection, { provider: 'github' });
  assert.equal(out.provider, 'github');
  assert.match(String(out.link), /toolkit=github/);
});

test('scope is enforced', async () => {
  const scoped = createMetaTools({ runtime, scope: new Set(['github']), connectUrl: () => '' });
  const search = await call(scoped.searchTool, { pattern: 'calculate' });
  assert.equal(search.matches, 0);
  const exec = await call(scoped.executeTool, { toolName: 'calculateSum', args: { a: 1, b: 1 } });
  assert.equal(exec.error, 'toolkit_out_of_scope');
});

// ── /api/bot/chat end to end, with a scripted model (no API key needed) ──────

const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};

function scriptedModel() {
  let step = 0;
  return new MockLanguageModelV3({
    doStream: async () => {
      step += 1;
      const chunks =
        step === 1
          ? [
              {
                type: 'tool-call',
                toolCallId: 'call-1',
                toolName: 'executeTool',
                input: JSON.stringify({ toolName: 'calculateSum', args: { a: 2, b: 3 } }),
              },
              { type: 'finish', finishReason: { unified: 'tool-calls', raw: undefined }, usage },
            ]
          : [
              { type: 'text-start', id: 't1' },
              { type: 'text-delta', id: 't1', delta: 'The sum is 5.' },
              { type: 'text-end', id: 't1' },
              { type: 'finish', finishReason: { unified: 'stop', raw: undefined }, usage },
            ];
      return { stream: simulateReadableStream({ chunks: chunks as never[] }) };
    },
  });
}

async function postChat(body: unknown) {
  const llm = { ok: true, provider: 'gemini', modelId: 'mock', model: scriptedModel() } as const;
  const app = express().use(express.json()).use(createBotRouter(runtime, llm));
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/bot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: res.status, text: await res.text() };
  } finally {
    server.close();
  }
}

const userMessage = { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'add 2 and 3' }] };

test('bot chat streams tool output + text in the UI message format', async () => {
  const { status, text } = await postChat({ toolkitIds: ['mathematics'], messages: [userMessage] });
  assert.equal(status, 200, text);
  assert.match(text, /"type":"tool-output-available"/);
  assert.match(text, /"toolkitId":"mathematics"/);
  assert.match(text, /The sum is 5\./);
});

test('bot chat rejects unknown toolkit ids', async () => {
  const { status, text } = await postChat({ toolkitIds: ['nope'], messages: [userMessage] });
  assert.equal(status, 400);
  assert.match(text, /Unknown toolkit ids: nope/);
});
