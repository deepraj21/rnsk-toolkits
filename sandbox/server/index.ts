import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { toolkits, registerAllTools } from '@rnsk/toolkits';
import { toolInputToJsonSchema } from '@rnsk/toolkits/core';
import { createToolRegistry } from './registry.js';
import { runToolkitTool } from './tool-runner.js';

const PORT = Number(process.env.PORT ?? 3100);

const sessionTokens = new Map<string, string>();
const sessionEnv = new Map<string, string>();

const registry = createToolRegistry();
registerAllTools(registry);

const credentials = {
  async getToken(tokenField: string) {
    return sessionTokens.get(tokenField) ?? null;
  },
  getServiceEnv(name: string) {
    return sessionEnv.get(name) ?? process.env[name];
  },
};

function isToolkitConfigured(id: string): boolean {
  const manifest = toolkits.find((t) => t.id === id);
  if (!manifest) return false;
  if (manifest.auth.type === 'none') return true;
  if (manifest.auth.type === 'service_env') {
    return manifest.auth.env.every((e) => Boolean(credentials.getServiceEnv(e.name)));
  }
  if (manifest.auth.type === 'oauth2') {
    const { env } = manifest.auth.provider;
    const clientId = process.env[env.clientId];
    const clientSecret = process.env[env.clientSecret];
    return Boolean(clientId && clientSecret);
  }
  return true;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, toolCount: registry.getToolNames().length });
});

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
        description: toolDef.description ?? toolDef.tool.description ?? '',
        scope: toolDef.scope,
        requiredAuth: toolDef.requiredAuth,
      })),
    })),
  });
});

app.get('/api/tools', (_req, res) => {
  res.json({
    tools: registry.getToolNames().map((name) => {
      const entry = registry.get(name)!;
      return {
        name: entry.name,
        description: entry.description,
        toolkitId: entry.toolkitId,
        scope: entry.scope,
        requiredAuth: entry.requiredAuth,
      };
    }),
  });
});

app.get('/api/tools/:toolName', (req, res) => {
  const toolName = req.params.toolName;
  const entry = registry.get(toolName);
  if (!entry) {
    res.status(404).json({ error: 'tool_not_found', toolName });
    return;
  }

  res.json({
    name: entry.name,
    description: entry.description,
    toolkitId: entry.toolkitId,
    scope: entry.scope,
    requiredAuth: entry.requiredAuth,
    input: toolInputToJsonSchema(entry.tool, entry.requiredAuth),
  });
});

app.post('/api/tools/execute', async (req, res) => {
  const { toolName, args } = req.body as {
    toolName?: string;
    args?: Record<string, unknown>;
  };

  if (!toolName || typeof toolName !== 'string') {
    res.status(400).json({ error: 'toolName is required' });
    return;
  }

  const result = await runToolkitTool(registry, credentials, toolName, args ?? {});
  const status = result.error ? 400 : 200;
  res.status(status).json(result);
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

app.listen(PORT, () => {
  console.log(`Toolkit sandbox running at http://localhost:${PORT}`);
  console.log(`  GET  /api/toolkits`);
  console.log(`  GET  /api/tools`);
  console.log(`  GET  /api/tools/:toolName`);
  console.log(`  POST /api/tools/execute`);
  console.log(`  POST /api/dev-token`);
  console.log(`Toolkits: ${toolkits.map((t) => t.id).join(', ')}`);
});
