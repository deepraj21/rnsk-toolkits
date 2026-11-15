// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

export const mistralCreateAgent = tool({
  description:
    'Creates a Mistral agent: a model plus instructions, tools (function/web search/code interpreter/…), and optional guardrails. Requires a model and name. Use the returned agent id with completeAgent, conversations, and batch jobs.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    model: z.string().describe('Base model ID for the agent, e.g. "mistral-large-latest"'),
    name: z.string().min(1).describe('Human-readable agent name'),
    instructions: z
      .string()
      .optional()
      .describe('System prompt the agent follows during conversations'),
    description: z.string().optional().describe('What the agent does (for listing/selection)'),
    tools: z
      .array(z.record(z.unknown()))
      .optional()
      .describe(
        'Tool definitions: { "type": "function", "function": {...} }, web_search, code_interpreter, etc.',
      ),
    handoffs: z.array(z.string()).optional().describe('Agent ids this agent can hand off to'),
    completionArgs: z
      .record(z.unknown())
      .optional()
      .describe('Default completion arguments (temperature, max_tokens, …) for its responses'),
    guardrails: z.record(z.unknown()).optional().describe('Guardrail configuration'),
    metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata'),
    versionMessage: z.string().optional().describe('Message describing this version'),
  }),
  execute: async ({
    mistralToken,
    model,
    name,
    instructions,
    description,
    tools,
    handoffs,
    completionArgs,
    guardrails,
    metadata,
    versionMessage,
  }) => {
    if (!model) return { error: 'model is required.' };
    if (!name) return { error: 'name is required.' };

    const result = await mistralRequest(mistralToken, '/agents', {
      method: 'POST',
      body: compact({
        model,
        name,
        instructions,
        description,
        tools,
        handoffs,
        completion_args: completionArgs,
        guardrails,
        metadata,
        version_message: versionMessage,
      }),
    });
    if (result.error) return result;

    return result.data;
  },
});
