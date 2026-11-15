// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

export const mistralCompleteAgent = tool({
  description:
    'Runs one turn against a Mistral agent and returns the agent’s reply. Provide the agent_id and the conversation messages; the agent applies its instructions, tools, and guardrails. For multi-turn stateful conversations prefer the conversation tools (create/append).',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    agentId: z.string().describe('Agent id from mistralListAgents / mistralCreateAgent'),
    messages: z
      .array(
        z.object({
          role: z.enum(['system', 'user', 'assistant', 'tool']).describe('Message author'),
          content: z
            .union([z.string(), z.array(z.unknown())])
            .describe('Message text, or an array of content parts'),
          tool_call_id: z
            .string()
            .optional()
            .describe('For role "tool": the tool call this result answers'),
          name: z.string().optional().describe('Optional sender name'),
        }),
      )
      .min(1)
      .describe('Conversation messages in order, e.g. [{ role: "user", content: "hi" }]'),
    maxTokens: z.number().min(0).optional().describe('Max tokens to generate'),
    stop: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Stop token(s) that end generation'),
    randomSeed: z.number().optional().describe('Fixed seed for reproducible output'),
    n: z.number().min(1).optional().describe('Number of completions to return'),
    responseFormat: z
      .record(z.unknown())
      .optional()
      .describe('Output format, e.g. { "type": "json_object" }'),
    tools: z
      .array(z.record(z.unknown()))
      .optional()
      .describe('Extra tool definitions for this turn'),
    toolChoice: z
      .union([z.string(), z.record(z.unknown())])
      .optional()
      .describe('Tool selection: "auto", "none", "required", or { "type": "function", ... }'),
    presencePenalty: z
      .number()
      .min(-2)
      .max(2)
      .optional()
      .describe('Penalty for tokens already present'),
    frequencyPenalty: z
      .number()
      .min(-2)
      .max(2)
      .optional()
      .describe('Penalty for tokens by frequency'),
    minTokens: z.number().min(0).optional().describe('Minimum tokens to generate'),
    repetitionPenalty: z.number().optional().describe('Penalty for repeating tokens'),
    topK: z.number().min(1).optional().describe('Top-k sampling cutoff'),
    parallelToolCalls: z.boolean().optional().describe('Allow calling multiple tools in one step'),
    reasoningEffort: z
      .string()
      .optional()
      .describe('Reasoning effort (e.g. "low", "medium", "high")'),
    metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata'),
  }),
  execute: async ({
    mistralToken,
    agentId,
    messages,
    maxTokens,
    stop,
    randomSeed,
    n,
    responseFormat,
    tools,
    toolChoice,
    presencePenalty,
    frequencyPenalty,
    minTokens,
    repetitionPenalty,
    topK,
    parallelToolCalls,
    reasoningEffort,
    metadata,
  }) => {
    if (!agentId) return { error: 'agentId is required.' };
    if (!messages || messages.length === 0)
      return { error: 'messages is required and must not be empty.' };

    const result = await mistralRequest(mistralToken, '/agents/completions', {
      method: 'POST',
      body: compact({
        agent_id: agentId,
        messages,
        max_tokens: maxTokens,
        stop,
        random_seed: randomSeed,
        n,
        response_format: responseFormat,
        tools,
        tool_choice: toolChoice,
        presence_penalty: presencePenalty,
        frequency_penalty: frequencyPenalty,
        min_tokens: minTokens,
        repetition_penalty: repetitionPenalty,
        top_k: topK,
        parallel_tool_calls: parallelToolCalls,
        reasoning_effort: reasoningEffort,
        metadata,
      }),
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      id: data.id,
      model: data.model,
      choices: data.choices,
      usage: data.usage,
    };
  },
});
