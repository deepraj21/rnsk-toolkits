// Toolkit + tool inspection and direct execution (the Tool runner; no LLM involved).

import { Router } from 'express';

import { getCredentialFields, getToolkitStatus } from '../credentials.js';
import { runRegisteredTool } from '../run-tool.js';
import type { SandboxRuntime } from '../runtime.js';

export function createToolkitsRouter(runtime: SandboxRuntime): Router {
  const router = Router();
  const { api, registry, credentials } = runtime;

  router.get('/api/toolkits', (_req, res) => {
    res.json({
      toolkits: api.toolkits.map((t) => ({
        id: t.id,
        displayName: t.displayName,
        shortDescription: t.shortDescription,
        category: t.category,
        icon: t.icon,
        authType: t.auth.type,
        toolCount: t.tools.length,
        status: getToolkitStatus(t, credentials),
        credentials: getCredentialFields(t, credentials),
        meta: t.meta ?? {},
        tools: t.tools.map((toolDef) => ({
          name: toolDef.name,
          description: toolDef.description ?? toolDef.tool.description ?? '',
          scope: toolDef.scope,
          requiredAuth: toolDef.requiredAuth,
        })),
      })),
    });
  });

  // Same shape as @rnsk/bot's generated toolkit index; pass it to <RunstackBot toolkitIndex>.
  router.get('/api/toolkit-index', (_req, res) => {
    res.json(
      api.toolkits.map((t) => ({
        id: t.id,
        displayName: t.displayName,
        logoUrl: t.icon.dataUri,
        oauthSlug: t.auth.type === 'oauth2' ? t.auth.provider.slug : null,
        requiredAuths: [
          ...new Set(
            t.tools
              .map((tool) => tool.requiredAuth)
              .filter((value): value is string => typeof value === 'string' && value.length > 0),
          ),
        ],
        tools: t.tools.map((tool) => tool.name),
      })),
    );
  });

  router.get('/api/tools', (req, res) => {
    const toolkitId = typeof req.query.toolkit === 'string' ? req.query.toolkit : undefined;
    res.json({
      tools: registry
        .getToolNames()
        .map((name) => registry.get(name)!)
        .filter((entry) => !toolkitId || entry.toolkitId === toolkitId)
        .map((entry) => ({
          name: entry.name,
          description: entry.description,
          toolkitId: entry.toolkitId,
          scope: entry.scope,
          requiredAuth: entry.requiredAuth,
        })),
    });
  });

  router.get('/api/tools/:toolName', (req, res) => {
    const entry = registry.get(req.params.toolName);
    if (!entry) {
      res.status(404).json({ error: 'tool_not_found', toolName: req.params.toolName });
      return;
    }
    res.json({
      name: entry.name,
      description: entry.description,
      toolkitId: entry.toolkitId,
      scope: entry.scope,
      requiredAuth: entry.requiredAuth,
      input: api.core.toolInputToJsonSchema(entry.tool, entry.requiredAuth),
    });
  });

  router.post('/api/tools/execute', async (req, res) => {
    const { toolName, args } = (req.body ?? {}) as {
      toolName?: unknown;
      args?: unknown;
    };
    if (typeof toolName !== 'string' || !toolName) {
      res.status(400).json({ error: 'toolName is required' });
      return;
    }
    if (args != null && (typeof args !== 'object' || Array.isArray(args))) {
      res.status(400).json({ error: 'args must be a JSON object' });
      return;
    }
    const result = await runRegisteredTool(runtime, toolName, (args ?? {}) as Record<string, unknown>);
    res.status(result.error ? 400 : 200).json(result);
  });

  return router;
}
