// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest, compact } from './client.js';

export const anthropicCreateMessage = tool({
  description:
    'Sends a prompt to a Claude model and returns the generated response. Configure the model, max_tokens, the conversation messages, and optional settings like system prompt, temperature, tools, tool_choice, and thinking. Use model IDs from listModels (e.g. claude-opus-5-5, claude-sonnet-5, claude-haiku-4-5).',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    model: z
      .string()
      .describe('Model ID, e.g. "claude-opus-5-5", "claude-sonnet-5", "claude-haiku-4-5"'),
    maxTokens: z.number().min(0).describe('Maximum tokens to generate before stopping (required)'),
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
    temperature: z
      .number()
      .optional()
      .describe('Sampling temperature 0-1 (not supported on Opus 4.7+)'),
    topP: z.number().optional().describe('Nucleus sampling cutoff (not supported on Opus 4.7+)'),
    topK: z.number().optional().describe('Top-k sampling (not supported on Opus 4.7+)'),
    stopSequences: z
      .array(z.string())
      .optional()
      .describe('Sequences that stop generation when produced'),
    stream: z.boolean().optional().describe('Stream partial progress (returns a stream body)'),
    tools: z.array(z.unknown()).optional().describe('Tool definitions the model may call'),
    toolChoice: z.unknown().optional().describe('How the model should use tools'),
    thinking: z.unknown().optional().describe('Extended thinking configuration'),
    serviceTier: z.string().optional().describe('Service tier, e.g. "standard" or "priority"'),
    metadata: z.unknown().optional().describe('Request metadata (user_id, user_location)'),
    userId: z.string().optional().describe('External user identifier for abuse detection'),
  }),
  execute: async ({
    anthropicApiKey,
    model,
    maxTokens,
    messages,
    system,
    temperature,
    topP,
    topK,
    stopSequences,
    stream,
    tools,
    toolChoice,
    thinking,
    serviceTier,
    metadata,
    userId,
  }) => {
    const body = compact({
      model,
      max_tokens: maxTokens,
      messages,
      system,
      metadata,
      temperature,
      top_p: topP,
      top_k: topK,
      stop_sequences: stopSequences,
      stream,
      tools,
      tool_choice: toolChoice,
      thinking,
      service_tier: serviceTier,
      user_id: userId,
    });

    const result = await anthropicRequest(anthropicApiKey, '/v1/messages', {
      method: 'POST',
      body,
    });
    if (result.error) return result;

    return {
      id: result.data?.id,
      type: result.data?.type,
      role: result.data?.role,
      model: result.data?.model,
      content: result.data?.content,
      stop_reason: result.data?.stop_reason,
      stop_sequence: result.data?.stop_sequence,
      usage: result.data?.usage,
    };
  },
});
