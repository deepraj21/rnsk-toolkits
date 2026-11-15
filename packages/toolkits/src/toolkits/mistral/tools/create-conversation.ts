// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

const conversationInputs = z
  .union([
    z.string(),
    z.array(
      z.object({
        role: z.enum(['user', 'assistant']).describe('Entry author'),
        content: z
          .union([z.string(), z.array(z.unknown())])
          .describe('Entry text, or an array of content parts'),
      }),
    ),
  ])
  .describe('Conversation input: a plain string, or an array of { role, content } entries');

export const mistralCreateConversation = tool({
  description:
    'Creates a stateful Mistral conversation seeded with initial inputs (a string or message entries). Optionally bind it to an agent_id or model, and set instructions/name/metadata. Returns the conversation id — use it with appendConversationMessage and getConversationMessages.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    inputs: conversationInputs,
    agentId: z.string().optional().describe('Agent to run the conversation with'),
    agentVersion: z
      .union([z.number(), z.string()])
      .optional()
      .describe('Agent version number or alias'),
    model: z.string().optional().describe('Model ID (when not using an agent)'),
    name: z.string().optional().describe('Human-readable conversation name'),
    description: z.string().optional().describe('Conversation description'),
    instructions: z.string().optional().describe('Extra system instructions for this conversation'),
    tools: z
      .array(z.record(z.unknown()))
      .optional()
      .describe('Tool definitions available to the conversation'),
    completionArgs: z
      .record(z.unknown())
      .optional()
      .describe('Default completion arguments (temperature, max_tokens, …)'),
    guardrails: z.record(z.unknown()).optional().describe('Guardrail configuration'),
    store: z.boolean().optional().describe('Store results on Mistral’s servers (default true)'),
    metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata'),
  }),
  execute: async ({
    mistralToken,
    inputs,
    agentId,
    agentVersion,
    model,
    name,
    description,
    instructions,
    tools,
    completionArgs,
    guardrails,
    store,
    metadata,
  }) => {
    if (inputs === undefined || inputs === null || inputs === '') {
      return { error: 'inputs is required (a string or an array of { role, content } entries).' };
    }

    const result = await mistralRequest(mistralToken, '/conversations', {
      method: 'POST',
      body: compact({
        inputs,
        agent_id: agentId,
        agent_version: agentVersion,
        model,
        name,
        description,
        instructions,
        tools,
        completion_args: completionArgs,
        guardrails,
        store,
        metadata,
      }),
    });
    if (result.error) return result;

    return result.data;
  },
});
