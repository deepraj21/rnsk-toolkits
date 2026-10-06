// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ollamaRequest, failedResult, toOllamaError } from './client.js';

const credentialsField = z
  .string()
  .optional()
  .describe(
    'Ollama credentials JSON like {"baseUrl":"http://localhost:11434"}; add "apiKey" for Ollama Cloud; defaults to local Ollama',
  );
const modelField = z.string().describe("Model name, e.g. 'llama3.1', 'mistral', 'gemma3:4b'");
const streamField = z
  .boolean()
  .optional()
  .describe('Stream partial responses as NDJSON events (default false for a single response)');
const keepAliveField = z
  .string()
  .optional()
  .describe("Keep model loaded, e.g. '5m', or '0' to unload immediately");
const optionsField = z
  .record(z.any())
  .optional()
  .describe('Model options: temperature, top_p, top_k, seed, num_ctx, num_predict, stop, min_p');

const messageSchema = z.object({
  role: z.string().describe("Author: 'system', 'user', 'assistant', or 'tool'"),
  content: z.string().describe('Message text'),
  images: z.array(z.string()).optional().describe('Base64-encoded images for multimodal models'),
  toolCalls: z
    .array(z.record(z.any()))
    .optional()
    .describe('Tool call requests produced by the model'),
});

export const ollamaChat = tool({
  description:
    'Chat with an Ollama model using conversation history. Supports tools, thinking, JSON format, images, and logprobs.',
  inputSchema: z.object({
    ollamaCredentials: credentialsField,
    model: modelField,
    messages: z.array(messageSchema).describe('Chat history as role/content message objects'),
    tools: z
      .array(z.record(z.any()))
      .optional()
      .describe('Function tools the model may call during chat'),
    format: z.string().optional().describe("Response format: 'json' for JSON output"),
    stream: streamField,
    think: z
      .union([z.boolean(), z.string()])
      .optional()
      .describe("Enable thinking output: true/false or 'high'/'medium'/'low'"),
    options: optionsField,
    keepAlive: keepAliveField,
    logprobs: z.boolean().optional().describe('Return log probabilities of output tokens'),
    topLogprobs: z
      .number()
      .int()
      .optional()
      .describe('Most likely tokens per position when logprobs is enabled'),
  }),
  execute: async ({
    ollamaCredentials,
    model,
    messages,
    tools,
    format,
    stream,
    think,
    options,
    keepAlive,
    logprobs,
    topLogprobs,
  }) => {
    try {
      const result = await ollamaRequest(ollamaCredentials, '/api/chat', {
        method: 'POST',
        body: {
          model,
          messages: messages.map(({ role, content, images, toolCalls }) => ({
            role,
            content,
            ...(images ? { images } : {}),
            ...(toolCalls ? { tool_calls: toolCalls } : {}),
          })),
          ...(tools ? { tools } : {}),
          ...(format ? { format } : {}),
          stream: stream ?? false,
          ...(think !== undefined ? { think } : {}),
          ...(options ? { options } : {}),
          ...(keepAlive ? { keep_alive: keepAlive } : {}),
          ...(logprobs !== undefined ? { logprobs } : {}),
          ...(topLogprobs !== undefined ? { top_logprobs: topLogprobs } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to chat with Ollama model', result);
      return result.data;
    } catch (error) {
      return toOllamaError(error, 'Error chatting with Ollama model');
    }
  },
});

export const ollamaGenerate = tool({
  description:
    'Generate text from an Ollama model for a prompt, with optional system prompt, images, suffix, and raw mode.',
  inputSchema: z.object({
    ollamaCredentials: credentialsField,
    model: modelField,
    prompt: z.string().optional().describe('Text to generate from'),
    system: z.string().optional().describe('System prompt'),
    suffix: z.string().optional().describe('Text after the prompt (fill-in-the-middle models)'),
    images: z.array(z.string()).optional().describe('Base64-encoded images for multimodal models'),
    format: z.string().optional().describe("Response format: 'json' for JSON output"),
    raw: z
      .boolean()
      .optional()
      .describe('Bypass prompt templating for full prompt control (no context returned)'),
    stream: streamField,
    think: z
      .union([z.boolean(), z.string()])
      .optional()
      .describe("Enable thinking output: true/false or 'high'/'medium'/'low'"),
    options: z
      .object({
        seed: z.number().int().optional(),
        stop: z.union([z.string(), z.array(z.string())]).optional(),
        minP: z.number().optional(),
        topK: z.number().int().optional(),
        topP: z.number().optional(),
        numCtx: z.number().int().optional(),
        numPredict: z.number().int().optional(),
        temperature: z.number().optional(),
      })
      .optional()
      .describe('Generation options'),
    keepAlive: keepAliveField,
    logprobs: z.boolean().optional(),
    topLogprobs: z.number().int().optional(),
  }),
  execute: async ({ ollamaCredentials, model, options, keepAlive, topLogprobs, ...rest }) => {
    try {
      const { seed, stop, topK, topP, numCtx, numPredict, temperature } = options ?? {};
      const result = await ollamaRequest(ollamaCredentials, '/api/generate', {
        method: 'POST',
        body: {
          model,
          ...rest,
          stream: rest.stream ?? false,
          ...(options
            ? {
                options: {
                  ...(seed !== undefined ? { seed } : {}),
                  ...(stop !== undefined ? { stop } : {}),
                  ...(options.minP !== undefined ? { min_p: options.minP } : {}),
                  ...(topK !== undefined ? { top_k: topK } : {}),
                  ...(topP !== undefined ? { top_p: topP } : {}),
                  ...(numCtx !== undefined ? { num_ctx: numCtx } : {}),
                  ...(numPredict !== undefined ? { num_predict: numPredict } : {}),
                  ...(temperature !== undefined ? { temperature } : {}),
                },
              }
            : {}),
          ...(keepAlive ? { keep_alive: keepAlive } : {}),
          ...(topLogprobs !== undefined ? { top_logprobs: topLogprobs } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to generate text with Ollama', result);
      return result.data;
    } catch (error) {
      return toOllamaError(error, 'Error generating text with Ollama');
    }
  },
});

export const ollamaOpenAiChat = tool({
  description:
    'OpenAI-compatible chat completion via Ollama. Use when you need conversational responses in OpenAI API format.',
  inputSchema: z.object({
    ollamaCredentials: credentialsField,
    model: modelField,
    messages: z
      .array(
        z.object({
          role: z.string().describe("Author: 'system', 'user', or 'assistant'"),
          content: z.string().describe('Message text'),
        }),
      )
      .describe('Conversation history'),
    temperature: z.number().optional(),
    topP: z.number().optional().describe('Nucleus sampling (default 1.0)'),
    maxTokens: z.number().int().optional().describe('Max tokens to generate'),
    stream: streamField,
    stop: z.union([z.string(), z.array(z.string())]).optional(),
    seed: z.number().int().optional(),
    n: z.number().int().optional().describe('Number of choices (default 1)'),
    user: z.string().optional().describe('End-user identifier for monitoring'),
    tools: z
      .array(z.record(z.any()))
      .optional()
      .describe('Tool/function definitions the model may call'),
    toolChoice: z.string().optional().describe("'none', 'auto', or a specific tool name"),
    responseFormat: z
      .object({ type: z.string() })
      .optional()
      .describe("Use {type:'json_object'} for JSON mode"),
    presencePenalty: z.number().optional(),
    frequencyPenalty: z.number().optional(),
    logitBias: z.record(z.number()).optional().describe('Token ID to bias (-100 to 100) map'),
    streamOptions: z.object({ includeUsage: z.boolean().optional() }).optional(),
  }),
  execute: async ({
    ollamaCredentials,
    model,
    messages,
    topP,
    maxTokens,
    stop,
    seed,
    n,
    user,
    tools,
    toolChoice,
    responseFormat,
    presencePenalty,
    frequencyPenalty,
    logitBias,
    streamOptions,
    ...rest
  }) => {
    try {
      const result = await ollamaRequest(ollamaCredentials, '/v1/chat/completions', {
        method: 'POST',
        body: {
          model,
          messages,
          ...rest,
          stream: rest.stream ?? false,
          ...(topP !== undefined ? { top_p: topP } : {}),
          ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
          ...(stop !== undefined ? { stop } : {}),
          ...(seed !== undefined ? { seed } : {}),
          ...(n !== undefined ? { n } : {}),
          ...(user ? { user } : {}),
          ...(tools ? { tools } : {}),
          ...(toolChoice ? { tool_choice: toolChoice } : {}),
          ...(responseFormat ? { response_format: responseFormat } : {}),
          ...(presencePenalty !== undefined ? { presence_penalty: presencePenalty } : {}),
          ...(frequencyPenalty !== undefined ? { frequency_penalty: frequencyPenalty } : {}),
          ...(logitBias ? { logit_bias: logitBias } : {}),
          ...(streamOptions ? { stream_options: streamOptions } : {}),
        },
      });
      if (!result.ok)
        return failedResult('Failed to create OpenAI-compatible chat completion', result);
      return result.data;
    } catch (error) {
      return toOllamaError(error, 'Error creating OpenAI-compatible chat completion');
    }
  },
});

export const ollamaOpenAiComplete = tool({
  description:
    'OpenAI-compatible text completion via Ollama. Use for plain text generation in OpenAI API format beyond chat.',
  inputSchema: z.object({
    ollamaCredentials: credentialsField,
    model: modelField,
    prompt: z.string().describe('Text prompt for completion'),
    temperature: z.number().optional(),
    topP: z.number().optional(),
    maxTokens: z.number().int().optional(),
    stream: streamField,
    stop: z.union([z.string(), z.array(z.string())]).optional(),
    seed: z.number().int().optional(),
    n: z.number().int().optional(),
    bestOf: z
      .number()
      .int()
      .optional()
      .describe('Server-side completions to generate and return the best of'),
    echo: z.boolean().optional().describe('Echo the prompt in the response'),
    suffix: z.string().optional().describe('Text after the completion (insertion mode)'),
    user: z.string().optional(),
    logprobs: z.number().int().optional().describe('Log probabilities to return (up to 5)'),
    logitBias: z.record(z.number()).optional(),
    presencePenalty: z.number().optional(),
    frequencyPenalty: z.number().optional(),
    streamOptions: z.object({ includeUsage: z.boolean().optional() }).optional(),
  }),
  execute: async ({
    ollamaCredentials,
    model,
    prompt,
    topP,
    maxTokens,
    stop,
    seed,
    n,
    bestOf,
    echo,
    suffix,
    user,
    logprobs,
    logitBias,
    presencePenalty,
    frequencyPenalty,
    streamOptions,
    ...rest
  }) => {
    try {
      const result = await ollamaRequest(ollamaCredentials, '/v1/completions', {
        method: 'POST',
        body: {
          model,
          prompt,
          ...rest,
          stream: rest.stream ?? false,
          ...(topP !== undefined ? { top_p: topP } : {}),
          ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
          ...(stop !== undefined ? { stop } : {}),
          ...(seed !== undefined ? { seed } : {}),
          ...(n !== undefined ? { n } : {}),
          ...(bestOf !== undefined ? { best_of: bestOf } : {}),
          ...(echo !== undefined ? { echo } : {}),
          ...(suffix ? { suffix } : {}),
          ...(user ? { user } : {}),
          ...(logprobs !== undefined ? { logprobs } : {}),
          ...(logitBias ? { logit_bias: logitBias } : {}),
          ...(presencePenalty !== undefined ? { presence_penalty: presencePenalty } : {}),
          ...(frequencyPenalty !== undefined ? { frequency_penalty: frequencyPenalty } : {}),
          ...(streamOptions ? { stream_options: streamOptions } : {}),
        },
      });
      if (!result.ok)
        return failedResult('Failed to create OpenAI-compatible text completion', result);
      return result.data;
    } catch (error) {
      return toOllamaError(error, 'Error creating OpenAI-compatible text completion');
    }
  },
});
