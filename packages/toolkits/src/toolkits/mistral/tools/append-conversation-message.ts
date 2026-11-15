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
  .describe('New input: a plain string, or an array of { role, content } entries');

export const mistralAppendConversationMessage = tool({
  description:
    'Appends new input to an existing Mistral conversation and runs the turn, returning the conversation state (including the agent’s reply). Use this for multi-turn conversations after mistralCreateConversation.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    conversationId: z
      .string()
      .min(1)
      .describe('Conversation id from mistralCreateConversation / mistralListConversations'),
    inputs: conversationInputs,
    store: z.boolean().optional().describe('Store results on Mistral’s servers (default true)'),
    handoffExecution: z
      .enum(['client', 'server'])
      .optional()
      .describe('Where agent handoffs execute (default "server")'),
    completionArgs: z
      .record(z.unknown())
      .optional()
      .describe('Completion arguments for this message (temperature, max_tokens, …)'),
    toolConfirmations: z
      .array(z.record(z.unknown()))
      .optional()
      .describe('Confirmations for tool calls awaiting approval'),
  }),
  execute: async ({
    mistralToken,
    conversationId,
    inputs,
    store,
    handoffExecution,
    completionArgs,
    toolConfirmations,
  }) => {
    if (!conversationId) return { error: 'conversationId is required.' };
    if (inputs === undefined || inputs === null || inputs === '') {
      return { error: 'inputs is required (a string or an array of { role, content } entries).' };
    }

    const result = await mistralRequest(
      mistralToken,
      `/conversations/${encodeURIComponent(conversationId)}`,
      {
        method: 'POST',
        body: compact({
          inputs,
          store,
          handoff_execution: handoffExecution,
          completion_args: completionArgs,
          tool_confirmations: toolConfirmations,
        }),
      },
    );
    if (result.error) return result;

    return result.data;
  },
});
