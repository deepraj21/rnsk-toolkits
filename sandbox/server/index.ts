import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, stepCountIs } from 'ai';
import { toolkits, registerAllTools } from '@rnsk/toolkits';
import { createToolRegistry } from './registry.js';
import { createSandboxMetaTools } from './meta-tools.js';

const PORT = Number(process.env.PORT ?? 3100);

const sessionTokens = new Map<string, string>();
const sessionEnv = new Map<string, string>();

const registry = createToolRegistry();
registerAllTools(registry);

function isToolkitConfigured(id: string): boolean {
  const manifest = toolkits.find((t) => t.id === id);
  if (!manifest) return false;
  if (manifest.auth.type === 'none') return true;
  if (manifest.auth.type === 'service_env') {
    return manifest.auth.env.every((e) => Boolean(process.env[e.name] || sessionEnv.get(e.name)));
  }
  if (manifest.auth.type === 'oauth2') {
    const clientId = process.env[manifest.auth.provider.env.clientId];
    const clientSecret = process.env[manifest.auth.provider.env.clientSecret];
    return Boolean(clientId && clientSecret);
  }
  return true;
}

const metaTools = createSandboxMetaTools(
  registry,
  {
    async getToken(tokenField) {
      return sessionTokens.get(tokenField) ?? null;
    },
    getServiceEnv(name) {
      return sessionEnv.get(name) ?? process.env[name];
    },
  },
  {
    getAppUrl: () => `http://localhost:${PORT}`,
    getProviderSlugs: () =>
      toolkits
        .filter((t) => t.auth.type === 'oauth2')
        .map((t) => (t.auth.type === 'oauth2' ? t.auth.provider.slug : '')),
    isToolkitAvailable: (toolkitId) => ({
      available: isToolkitConfigured(toolkitId),
      reason: isToolkitConfigured(toolkitId) ? undefined : 'not_configured',
    }),
  },
);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/toolkits', (_req, res) => {
  res.json({
    toolkits: toolkits.map((t) => ({
      id: t.id,
      displayName: t.displayName,
      shortDescription: t.shortDescription,
      category: t.category,
      icon: t.icon,
      toolCount: t.tools.length,
      available: isToolkitConfigured(t.id),
      tools: t.tools.map((toolDef) => ({
        name: toolDef.name,
        scope: toolDef.scope,
        requiredAuth: toolDef.requiredAuth,
      })),
    })),
  });
});

app.post('/api/dev-token', (req, res) => {
  const { tokenField, token, envName, envValue } = req.body as {
    tokenField?: string;
    token?: string;
    envName?: string;
    envValue?: string;
  };
  if (tokenField && token) sessionTokens.set(tokenField, token);
  if (envName && envValue) sessionEnv.set(envName, envValue);
  res.json({ ok: true });
});

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENROUTER_API_KEY not set in .env.local' });
    return;
  }

  const { messages } = req.body as { messages: Array<{ role: string; content: string }> };
  const openrouter = createOpenRouter({ apiKey });

  const result = streamText({
    model: openrouter(process.env.SANDBOX_MODEL ?? 'openai/gpt-4o-mini'),
    messages,
    tools: {
      searchTool: metaTools.searchTool,
      checkAuthentication: metaTools.checkAuthentication,
      initiateConnection: metaTools.initiateConnection,
      executeTool: metaTools.executeTool,
    },
    stopWhen: stepCountIs(10),
  });

  result.pipeTextStreamToResponse(res);
});

app.listen(PORT, () => {
  console.log(`Sandbox server running at http://localhost:${PORT}`);
  console.log(`Toolkits: ${toolkits.map((t) => t.id).join(', ')}`);
});
