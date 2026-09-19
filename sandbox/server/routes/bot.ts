// The Runstack bot API (/api/bot/config, /api/bot/chat), served from local toolkits.
// Point <RunstackBot apiBase=...> here to chat with whatever is in packages/toolkits.
// Mirrors Runstack's server/src/services/bot-chat.service.ts, minus Studio agents and guardrails.

import {
  consumeStream,
  convertToModelMessages,
  createIdGenerator,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { Router, type Request } from 'express';

import { createMetaTools } from '../meta-tools.js';
import { describeLlmError, type LlmStatus } from '../model.js';
import type { SandboxRuntime } from '../runtime.js';

const DEFAULT_WEB_ORIGIN = 'http://localhost:5173';

export const BOT_SYSTEM_MESSAGE = `You are a helpful assistant embedded in a website chat widget. When a user asks a question:

1. First, understand the user's query thoroughly.

2. You have access to meta tools:
   - searchTool: Search for available tools in the Runstack registry based on your requirements
   - checkAuthentication: Check whether the user is authenticated for a specific registry tool (use when a tool has requiredAuth)
   - initiateConnection: Start connecting an external provider (e.g. GitHub). The chat UI renders a Connect button automatically; use when checkAuthentication returns not authenticated.
   - executeTool: Execute any tool from the Runstack registry

3. Your workflow should be:
   a. For Runstack registry tools, use searchTool to find tools that match the user's requirements
   b. If a registry tool has requiredAuth (e.g. githubToken), call checkAuthentication(toolName) before executing
   c. If checkAuthentication returns not authenticated, call initiateConnection with the appropriate provider. The chat UI shows a Connect button — tell the user to click it to connect, but do not paste or repeat the connection URL in your message; do not call executeTool until they have connected
   d. If authenticated (or the tool has no requiredAuth), use executeTool to execute the appropriate registry tool(s) with the correct parameters
   e. Validate whether the returned tools can help accomplish the task; if not, try searching again with different parameters or keywords
   f. You do not need to ask the user whether to execute a tool; if you find the tool and it is authenticated (or does not require auth), execute it

4. Always ensure you understand what each tool does before executing it, and provide clear responses to the user based on the tool results.`;

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim()),
    ),
  ];
}

function webOrigin(req: Request): string {
  const origin = req.headers.origin;
  return typeof origin === 'string' && origin ? origin : process.env.WEB_ORIGIN ?? DEFAULT_WEB_ORIGIN;
}

export function buildInstructions(scope: string[], systemPrompt?: string): string {
  const custom = systemPrompt?.trim() ? `\nAdditional instructions:\n${systemPrompt.trim()}\n` : '';
  const scoped =
    scope.length > 0
      ? `\nToolkit scope (strict): Only use tools from these toolkit ids: ${scope.join(', ')}. Do not search for, connect, or execute tools outside this scope. If the user asks for something you cannot do with these toolkits, explain the limitation.\n`
      : '';
  return `${BOT_SYSTEM_MESSAGE}\n${custom}${scoped}`;
}

export function createBotRouter(runtime: SandboxRuntime, llm: LlmStatus): Router {
  const router = Router();
  let warnedAgents = false;

  router.get('/api/bot/config', (_req, res) => {
    res.json({
      branding: {
        companyName: 'Toolkit Sandbox',
        websiteUrl: null,
        fontStyle: 'system',
        textColor: '#111827',
        logoUrl: null,
        updatedAt: null,
      },
      botModel: llm.ok ? { provider: llm.provider, modelId: llm.modelId } : null,
    });
  });

  router.post('/api/bot/chat', async (req, res) => {
    if (!llm.ok) {
      res.status(503).json({ error: llm.message, code: llm.code, hint: llm.hint });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    if (!Array.isArray(body.messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const toolkitIds = parseStringArray(body.toolkitIds);
    const known = new Set(runtime.api.toolkits.map((t) => t.id));
    const unknown = toolkitIds.filter((id) => !known.has(id));
    if (unknown.length > 0) {
      res.status(400).json({
        error: `Unknown toolkit ids: ${unknown.join(', ')}`,
        availableToolkits: [...known],
      });
      return;
    }

    if (parseStringArray(body.agentIds).length > 0 && !warnedAgents) {
      warnedAgents = true;
      console.warn('[sandbox] agentIds are ignored: Studio agents only exist in Runstack.');
    }

    const origin = webOrigin(req);
    const messages = body.messages as UIMessage[];

    try {
      // streamText (not ToolLoopAgent) so onError can replace the SDK's default full-object console dump.
      const result = streamText({
        model: llm.model,
        system: buildInstructions(
          toolkitIds,
          typeof body.systemPrompt === 'string' ? body.systemPrompt : undefined,
        ),
        messages: await convertToModelMessages(messages),
        tools: createMetaTools({
          runtime,
          scope: toolkitIds.length > 0 ? new Set(toolkitIds) : null,
          connectUrl: (toolkitId) =>
            `${origin}/?toolkit=${encodeURIComponent(toolkitId)}&connect=1`,
        }),
        stopWhen: stepCountIs(8),
        onError: ({ error }) => console.error(`[sandbox] chat error: ${describeLlmError(error)}`),
      });

      result.pipeUIMessageStreamToResponse(res, {
        originalMessages: messages,
        generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
        consumeSseStream: consumeStream,
        onError: describeLlmError,
        messageMetadata: ({ part }) =>
          part.type === 'finish' ? { usage: part.totalUsage, modelId: llm.modelId } : undefined,
      });
    } catch (error) {
      console.error(`[sandbox] chat error: ${describeLlmError(error)}`);
      if (!res.headersSent) res.status(500).json({ error: describeLlmError(error) });
    }
  });

  return router;
}
