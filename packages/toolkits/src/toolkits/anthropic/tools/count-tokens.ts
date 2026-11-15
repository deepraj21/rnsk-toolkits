// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest, compact } from './client.js';

export const anthropicCountTokens = tool({
  description:
    'Counts the tokens a message request would use — including the system prompt, tools, and images — without running the model. Use it to estimate cost and check context-window fit before calling createMessage.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    model: z.string().describe('Model ID the request would target'),
    messages: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']).describe('Message author'),
          content: z
            .union([z.string(), z.array(z.unknown())])
            .describe('Text string, or an array of content blocks'),
        }),
      )
      .describe('Conversation messages, oldest first'),
    system: z
      .union([z.string(), z.array(z.unknown())])
      .optional()
      .describe('System prompt / instructions'),
    tools: z.array(z.unknown()).optional().describe('Tool definitions that would be sent'),
    toolChoice: z.unknown().optional().describe('Tool choice that would be sent'),
    thinking: z.unknown().optional().describe('Thinking configuration that would be sent'),
    stopSequences: z.array(z.string()).optional().describe('Stop sequences that would be sent'),
  }),
  execute: async ({
    anthropicApiKey,
    model,
    messages,
    system,
    tools,
    toolChoice,
    thinking,
    stopSequences,
  }) => {
    const body = compact({
      model,
      messages,
      system,
      tools,
      tool_choice: toolChoice,
      thinking,
      stop_sequences: stopSequences,
    });

    const result = await anthropicRequest(anthropicApiKey, '/v1/messages/count_tokens', {
      method: 'POST',
      body,
    });
    if (result.error) return result;

    return result.data;
  },
});
