// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

export const mistralChatCompletion = tool({
  description:
    'Sends a chat prompt to a Mistral model and returns the generated message(s). Configure the model, the conversation messages, and optional settings like temperature, max_tokens, tools, tool_choice, response_format (text/json), and reasoning_effort. Use model IDs from mistralListModels (e.g. mistral-small-latest, mistral-large-latest, codestral-latest).',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    model: z
      .string()
      .describe(
        'Model ID, e.g. "mistral-small-latest", "mistral-large-latest", "codestral-latest"',
      ),
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
    temperature: z.number().min(0).max(2).optional().describe('Sampling temperature (0-2)'),
    topP: z.number().min(0).max(1).optional().describe('Nucleus sampling cutoff (0-1)'),
    maxTokens: z.number().min(0).optional().describe('Max tokens to generate'),
    minTokens: z.number().min(0).optional().describe('Minimum tokens to generate'),
    topK: z.number().min(1).optional().describe('Top-k sampling cutoff'),
    stop: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Stop token(s) that end generation'),
    randomSeed: z.number().optional().describe('Fixed seed for reproducible output'),
    n: z.number().min(1).optional().describe('Number of completions to return'),
    responseFormat: z
      .record(z.unknown())
      .optional()
      .describe(
        'Output format, e.g. { "type": "json_object" } or { "type": "json_schema", "json_schema": {...} }',
      ),
    tools: z
      .array(z.record(z.unknown()))
      .optional()
      .describe(
        'Tool definitions, e.g. [{ "type": "function", "function": { "name", "description", "parameters" } }]',
      ),
    toolChoice: z
      .union([z.string(), z.record(z.unknown())])
      .optional()
      .describe(
        'Tool selection: "auto", "none", "required", or { "type": "function", "function": {...} }',
      ),
    presencePenalty: z
      .number()
      .min(-2)
      .max(2)
      .optional()
      .describe('Penalty for tokens already present (-2 to 2)'),
    frequencyPenalty: z
      .number()
      .min(-2)
      .max(2)
      .optional()
      .describe('Penalty for tokens by frequency (-2 to 2)'),
    repetitionPenalty: z.number().optional().describe('Penalty for repeating tokens'),
    parallelToolCalls: z.boolean().optional().describe('Allow calling multiple tools in one step'),
    reasoningEffort: z
      .string()
      .optional()
      .describe('Reasoning effort for reasoning models (e.g. "low", "medium", "high")'),
    safePrompt: z.boolean().optional().describe('Enable Mistral’s safe prompt biasing'),
    metadata: z
      .record(z.unknown())
      .optional()
      .describe('Arbitrary metadata echoed back with the response'),
  }),
  execute: async ({
    mistralToken,
    model,
    messages,
    temperature,
    topP,
    maxTokens,
    minTokens,
    topK,
    stop,
    randomSeed,
    n,
    responseFormat,
    tools,
    toolChoice,
    presencePenalty,
    frequencyPenalty,
    repetitionPenalty,
    parallelToolCalls,
    reasoningEffort,
    safePrompt,
    metadata,
  }) => {
    if (!model) return { error: 'model is required.' };
    if (!messages || messages.length === 0)
      return { error: 'messages is required and must not be empty.' };

    const result = await mistralRequest(mistralToken, '/chat/completions', {
      method: 'POST',
      body: compact({
        model,
        messages,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        min_tokens: minTokens,
        top_k: topK,
        stop,
        random_seed: randomSeed,
        n,
        response_format: responseFormat,
        tools,
        tool_choice: toolChoice,
        presence_penalty: presencePenalty,
        frequency_penalty: frequencyPenalty,
        repetition_penalty: repetitionPenalty,
        parallel_tool_calls: parallelToolCalls,
        reasoning_effort: reasoningEffort,
        safe_prompt: safePrompt,
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
