// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');
const responseIdField = z
  .string()
  .describe('Response ID (resp_...) — get it from openaiCreateResponse');
const modelField = z
  .string()
  .describe('Model ID, e.g. gpt-5.1, gpt-4.1, gpt-4o-mini — see openaiListModels');

export const openaiCreateResponse = tool({
  description:
    'Run the OpenAI Responses API: send a prompt (or full conversation input) to a model and get a model-generated answer. Supports instructions, built-in tools (web search, file search), function tools, JSON output format, and continuing a previous response.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    model: modelField,
    input: z
      .union([z.string(), z.array(z.record(z.any()))])
      .describe('Prompt text, or an array of message/input items with roles and content parts'),
    instructions: z.string().optional().describe('System-style instructions steered at the model'),
    tools: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Tool definitions: function tools {type:"function", name, parameters, description} or built-in tools {type:"web_search"} etc.',
      ),
    toolChoice: z
      .union([z.string(), z.record(z.any())])
      .optional()
      .describe(
        'Tool selection mode: "auto", "none", "required", or {"type":"function","name":"..."}',
      ),
    temperature: z.number().min(0).max(2).optional().describe('Sampling temperature'),
    topP: z.number().min(0).max(1).optional().describe('Nucleus sampling cutoff'),
    maxOutputTokens: z.number().int().positive().optional().describe('Cap on generated tokens'),
    textFormat: z
      .record(z.any())
      .optional()
      .describe(
        'Output format, e.g. {type:"json_schema", name, schema, strict:true} for structured outputs',
      ),
    previousResponseId: z
      .string()
      .optional()
      .describe('Chain onto an earlier response to continue its conversation'),
    store: z
      .boolean()
      .optional()
      .describe('Store the response on OpenAI servers for later retrieval (default true)'),
    metadata: z
      .record(z.any())
      .optional()
      .describe('Key/value metadata to store with the response'),
  }),
  execute: async ({
    openaiApiKey,
    model,
    input,
    instructions,
    tools,
    toolChoice,
    temperature,
    topP,
    maxOutputTokens,
    textFormat,
    previousResponseId,
    store,
    metadata,
  }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/responses', {
        method: 'POST',
        body: {
          model,
          input,
          ...(instructions ? { instructions } : {}),
          ...(tools ? { tools } : {}),
          ...(toolChoice !== undefined ? { tool_choice: toolChoice } : {}),
          ...(temperature !== undefined ? { temperature } : {}),
          ...(topP !== undefined ? { top_p: topP } : {}),
          ...(maxOutputTokens !== undefined ? { max_output_tokens: maxOutputTokens } : {}),
          ...(textFormat ? { text: { format: textFormat } } : {}),
          ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
          ...(store !== undefined ? { store } : {}),
          ...(metadata ? { metadata } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create response', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error creating response');
    }
  },
});

export const openaiGetResponse = tool({
  description:
    'Retrieve a previously stored model response by ID, including its output items, usage, and status (useful for background responses or auditing).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    responseId: responseIdField,
  }),
  execute: async ({ openaiApiKey, responseId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/responses/${responseId}`);
      if (!result.ok) return failedResult('Failed to get response', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error getting response');
    }
  },
});

export const openaiListResponseInputItems = tool({
  description:
    'List the input items of a stored response (the conversation/messages it saw), with paging via the returned next cursor.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    responseId: responseIdField,
    after: z.string().optional().describe('Cursor for paging — pass the previous next value'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Items per page (default 20, max 100)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order of items'),
  }),
  execute: async ({ openaiApiKey, responseId, after, limit, order }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/responses/${responseId}/input_items`, {
        query: { after, limit, order },
      });
      if (!result.ok) return failedResult('Failed to list input items', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error listing input items');
    }
  },
});

export const openaiCancelResponse = tool({
  description:
    'Cancel a background (stream:false + background:true) response that is still running, so it stops consuming tokens.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    responseId: responseIdField,
  }),
  execute: async ({ openaiApiKey, responseId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/responses/${responseId}/cancel`, {
        method: 'POST',
        body: {},
      });
      if (!result.ok) return failedResult('Failed to cancel response', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error cancelling response');
    }
  },
});

export const openaiDeleteResponse = tool({
  description:
    'Delete a stored response and its server-side state permanently. Use when a response should no longer be retrievable.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    responseId: responseIdField,
  }),
  execute: async ({ openaiApiKey, responseId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/responses/${responseId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete response', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error deleting response');
    }
  },
});

export const openaiCreateChatCompletion = tool({
  description:
    'Create a chat completion via the classic Chat Completions API: a list of chat messages in, one model message out. Use when a consumer or library expects /chat/completions instead of the Responses API.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    model: modelField,
    messages: z
      .array(z.record(z.any()))
      .describe('Chat messages, e.g. [{role:"system",content:"..."},{role:"user",content:"..."}]'),
    temperature: z.number().min(0).max(2).optional().describe('Sampling temperature'),
    topP: z.number().min(0).max(1).optional().describe('Nucleus sampling cutoff'),
    maxTokens: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Cap on generated tokens (sent as max_completion_tokens)'),
    tools: z.array(z.record(z.any())).optional().describe('Function tool definitions'),
    toolChoice: z
      .union([z.string(), z.record(z.any())])
      .optional()
      .describe('Tool selection mode: "auto", "none", "required", or a specific function'),
    responseFormat: z
      .record(z.any())
      .optional()
      .describe(
        'Output format, e.g. {type:"json_object"} or {type:"json_schema", json_schema:{...}}',
      ),
    stop: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Stop sequence(s)'),
    seed: z.number().optional().describe('Deterministic sampling seed'),
    user: z.string().optional().describe('End-user identifier for abuse monitoring'),
  }),
  execute: async ({
    openaiApiKey,
    model,
    messages,
    temperature,
    topP,
    maxTokens,
    tools,
    toolChoice,
    responseFormat,
    stop,
    seed,
    user,
  }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/chat/completions', {
        method: 'POST',
        body: {
          model,
          messages,
          ...(temperature !== undefined ? { temperature } : {}),
          ...(topP !== undefined ? { top_p: topP } : {}),
          ...(maxTokens !== undefined ? { max_completion_tokens: maxTokens } : {}),
          ...(tools ? { tools } : {}),
          ...(toolChoice !== undefined ? { tool_choice: toolChoice } : {}),
          ...(responseFormat ? { response_format: responseFormat } : {}),
          ...(stop !== undefined ? { stop } : {}),
          ...(seed !== undefined ? { seed } : {}),
          ...(user ? { user } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create chat completion', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error creating chat completion');
    }
  },
});
