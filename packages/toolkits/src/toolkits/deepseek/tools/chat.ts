// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { deepseekRequest, compact } from './client.js';

export const deepseekCreateChatCompletion = tool({
  description:
    'Sends a conversation to a DeepSeek model and returns the generated reply (OpenAI-compatible chat completions). Configure the model (deepseek-flash for speed/price, deepseek-v4-pro for max quality), the messages, and optional thinking mode, reasoning effort, tools (function tools plus DeepSeek built-ins like {"type":"deepseek_web_search"} and {"type":"deepseek_read_url"}), JSON output via responseFormat, safety checks, and a conversation title. Streaming is not supported — the complete response comes back as JSON. Use deepseekListModels to discover current model IDs.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    model: z
      .string()
      .describe('Model ID, e.g. "deepseek-flash" or "deepseek-v4-pro" (see deepseekListModels)'),
    messages: z
      .array(
        z.object({
          role: z
            .enum(['system', 'user', 'assistant', 'tool', 'latest-reminder'])
            .describe('Message author'),
          content: z
            .union([z.string(), z.array(z.unknown())])
            .describe('Message text, or an array of content parts (e.g. images)'),
          tool_call_id: z
            .string()
            .optional()
            .describe('For role "tool": the tool call this result answers'),
          name: z.string().optional().describe('Optional sender name'),
        }),
      )
      .min(1)
      .describe('Conversation messages in order, e.g. [{ role: "user", content: "hi" }]'),
    thinking: z
      .record(z.any())
      .optional()
      .describe(
        'Thinking mode toggle, e.g. {"type":"enabled"} or {"type":"disabled"} (takes precedence over reasoningEffort when present)',
      ),
    reasoningEffort: z
      .enum(['none', 'low', 'high', 'max'])
      .optional()
      .describe(
        'Thinking effort — "none" disables thinking; low/high/max enable it (default follows the model)',
      ),
    maxTokens: z.number().int().min(1).optional().describe('Maximum tokens to generate'),
    responseFormat: z
      .record(z.any())
      .optional()
      .describe(
        'Output format, e.g. {"type":"json_object"} for guaranteed valid JSON (also instruct the model in your message to produce JSON)',
      ),
    stop: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Stop sequence(s) — up to 16 strings where generation ends'),
    temperature: z.number().min(0).max(2).optional().describe('Sampling temperature (0-2)'),
    topP: z.number().min(0).max(1).optional().describe('Nucleus sampling cutoff (0-1)'),
    tools: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Tools the model may call — function tools [{"type":"function","function":{...}}] and DeepSeek built-ins {"type":"deepseek_web_search"} (web search) or {"type":"deepseek_read_url"}',
      ),
    toolChoice: z
      .union([z.string(), z.record(z.any())])
      .optional()
      .describe(
        'Tool selection: "none", "auto", "required", or {"type":"function","function":{...}}',
      ),
    safetyCheck: z
      .enum(['low', 'high'])
      .optional()
      .describe('DeepSeek risk control: "high" reviews model input and output for safety'),
    title: z
      .record(z.any())
      .optional()
      .describe(
        'Ask for a conversation title: {"enabled": true} — response then carries a "title" field',
      ),
    logprobs: z.boolean().optional().describe('Return log probabilities of output tokens'),
    topLogprobs: z
      .number()
      .int()
      .min(0)
      .max(20)
      .optional()
      .describe('Number of most likely tokens to return per position (0-20, needs logprobs)'),
    userId: z.string().optional().describe('Custom end-user identifier for abuse detection'),
    extra: z
      .record(z.any())
      .optional()
      .describe('Any additional DeepSeek chat parameters merged into the body verbatim'),
  }),
  execute: async ({
    deepseekToken,
    model,
    messages,
    thinking,
    reasoningEffort,
    maxTokens,
    responseFormat,
    stop,
    temperature,
    topP,
    tools,
    toolChoice,
    safetyCheck,
    title,
    logprobs,
    topLogprobs,
    userId,
    extra,
  }) => {
    if (!model) return { error: 'model is required.' };
    if (!messages || !messages.length)
      return { error: 'messages is required and must not be empty.' };

    const result = await deepseekRequest(deepseekToken, '/chat/completions', {
      method: 'POST',
      body: compact({
        model,
        messages,
        thinking,
        reasoning_effort: reasoningEffort,
        max_tokens: maxTokens,
        response_format: responseFormat,
        stop,
        temperature,
        top_p: topP,
        tools,
        tool_choice: toolChoice,
        safety_check: safetyCheck,
        title,
        logprobs,
        top_logprobs: topLogprobs,
        user_id: userId,
        ...(extra || {}),
      }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const deepseekFimCompletion = tool({
  description:
    'Fill-in-the-middle (FIM) code completion — given code with a gap, DeepSeek inserts the missing span (POST /beta/completions). Put the cursor position in prompt and any trailing code in suffix; the model returns the inserted text between them. Also usable as plain text completion. Echo the prompt, stop sequences, and temperature are supported. Streaming is not supported — the complete response comes back as JSON.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    model: z
      .string()
      .describe('Model ID, e.g. "deepseek-flash" or "deepseek-v4-pro" (see deepseekListModels)'),
    prompt: z
      .string()
      .describe('Code/text before the completion point — e.g. everything above the cursor'),
    suffix: z
      .string()
      .optional()
      .describe(
        'Code/text after the completion point (FIM) — the model inserts between prompt and suffix',
      ),
    echo: z.boolean().optional().describe('Echo the prompt back alongside the completion'),
    logprobs: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Also return log probabilities for the N most likely tokens'),
    maxTokens: z.number().int().min(1).optional().describe('Maximum tokens to generate'),
    stop: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Stop sequence(s) — up to 16 strings where generation ends'),
    temperature: z.number().min(0).max(2).optional().describe('Sampling temperature (0-2)'),
    topP: z.number().min(0).max(1).optional().describe('Nucleus sampling cutoff (0-1)'),
    extra: z
      .record(z.any())
      .optional()
      .describe('Any additional completion parameters merged into the body verbatim'),
  }),
  execute: async ({
    deepseekToken,
    model,
    prompt,
    suffix,
    echo,
    logprobs,
    maxTokens,
    stop,
    temperature,
    topP,
    extra,
  }) => {
    if (!model) return { error: 'model is required.' };
    if (!prompt) return { error: 'prompt is required.' };

    const result = await deepseekRequest(deepseekToken, '/beta/completions', {
      method: 'POST',
      body: compact({
        model,
        prompt,
        suffix,
        echo,
        logprobs,
        max_tokens: maxTokens,
        stop,
        temperature,
        top_p: topP,
        ...(extra || {}),
      }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const deepseekCreateAnthropicMessage = tool({
  description:
    "Sends a conversation using the Anthropic Messages format (POST /anthropic/v1/messages) — use this when your prompts, tool definitions, or client code are shaped for the Claude/Anthropic API instead of OpenAI's. Accepts Anthropic message arrays, system prompt, thinking config, tools/tool_choice, and stop_sequences; Claude model aliases (claude-*) are accepted alongside deepseek-flash and deepseek-v4-pro. Returns an Anthropic-style message with content blocks. Streaming is not supported.",
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    model: z
      .string()
      .describe(
        'Model ID — "deepseek-flash", "deepseek-v4-pro", or a Claude alias like "claude-sonnet-4-5"',
      ),
    messages: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']).describe('Message author'),
          content: z
            .union([z.string(), z.array(z.unknown())])
            .describe('Message text, or an array of Anthropic content blocks'),
        }),
      )
      .min(1)
      .describe('Conversation messages in order, e.g. [{ role: "user", content: "hi" }]'),
    system: z
      .union([z.string(), z.array(z.unknown())])
      .optional()
      .describe('System prompt (string or Anthropic content blocks)'),
    maxTokens: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Maximum tokens to generate (Anthropic SDKs require it; optional at the HTTP level)',
      ),
    thinking: z
      .record(z.any())
      .optional()
      .describe('Anthropic thinking config, e.g. {"type":"enabled","budget_tokens":1024}'),
    tools: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Tool definitions — Anthropic-style tools and DeepSeek built-ins ({"type":"deepseek_web_search"}, {"type":"deepseek_read_url"})',
      ),
    toolChoice: z
      .record(z.any())
      .optional()
      .describe('Anthropic tool choice, e.g. {"type":"auto"} or {"type":"tool","name":"..."}'),
    stopSequences: z
      .array(z.string())
      .optional()
      .describe('Stop sequence(s) — generation ends when one is produced'),
    temperature: z.number().min(0).max(2).optional().describe('Sampling temperature (0-2)'),
    topP: z.number().min(0).max(1).optional().describe('Nucleus sampling cutoff (0-1)'),
    metadata: z.record(z.any()).optional().describe('Anthropic metadata, e.g. {"user_id":"..."}'),
    safetyCheck: z
      .enum(['low', 'high'])
      .optional()
      .describe('DeepSeek risk control: "high" reviews model input and output for safety'),
    title: z.record(z.any()).optional().describe('Ask for a conversation title: {"enabled": true}'),
    extra: z
      .record(z.any())
      .optional()
      .describe('Any additional message parameters merged into the body verbatim'),
  }),
  execute: async ({
    deepseekToken,
    model,
    messages,
    system,
    maxTokens,
    thinking,
    tools,
    toolChoice,
    stopSequences,
    temperature,
    topP,
    metadata,
    safetyCheck,
    title,
    extra,
  }) => {
    if (!model) return { error: 'model is required.' };
    if (!messages || !messages.length)
      return { error: 'messages is required and must not be empty.' };

    const result = await deepseekRequest(deepseekToken, '/anthropic/v1/messages', {
      method: 'POST',
      body: compact({
        model,
        messages,
        system,
        max_tokens: maxTokens,
        thinking,
        tools,
        tool_choice: toolChoice,
        stop_sequences: stopSequences,
        temperature,
        top_p: topP,
        metadata,
        safety_check: safetyCheck,
        title,
        ...(extra || {}),
      }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const deepseekCreateResponse = tool({
  description:
    'Runs an OpenAI Responses-style request (POST /responses) — a single input (string or item list) plus optional instructions, reasoning effort, structured text output (json_object/json_schema), and function tools. Use it when you want OpenAI Responses API semantics (stateless input + instructions) rather than a full messages array. Streaming is not supported — the completed response comes back as JSON.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    model: z
      .string()
      .describe('Model ID, e.g. "deepseek-flash" or "deepseek-v4-pro" (see deepseekListModels)'),
    input: z
      .union([z.string(), z.array(z.any())])
      .optional()
      .describe(
        'The input — a plain string (treated as one user message) or a list of input items (messages, function call outputs)',
      ),
    instructions: z
      .string()
      .optional()
      .describe('System-level instruction inserted before the input'),
    reasoning: z.enum(['none', 'low', 'high', 'max']).optional().describe('Thinking mode effort'),
    maxOutputTokens: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Upper bound on generated tokens (visible + reasoning)'),
    temperature: z.number().min(0).max(2).optional().describe('Sampling temperature (0-2)'),
    topP: z.number().min(0).max(1).optional().describe('Nucleus sampling cutoff (0-1)'),
    text: z
      .record(z.any())
      .optional()
      .describe('Text output config, e.g. {"format":{"type":"json_object"}} for JSON output'),
    tools: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Function tools the model may call, e.g. [{"type":"function","name":"...","parameters":{...}}]',
      ),
    toolChoice: z
      .union([z.string(), z.record(z.any())])
      .optional()
      .describe('Tool selection, e.g. "auto" or {"type":"function","name":"..."}'),
    topLogprobs: z
      .number()
      .int()
      .min(0)
      .max(20)
      .optional()
      .describe('Most likely tokens to return per position (0-20)'),
    user: z.string().optional().describe('Custom end-user identifier'),
    safetyCheck: z
      .enum(['low', 'high'])
      .optional()
      .describe('DeepSeek risk control: "high" reviews model input and output for safety'),
    title: z.record(z.any()).optional().describe('Ask for a conversation title: {"enabled": true}'),
    extra: z
      .record(z.any())
      .optional()
      .describe('Any additional response parameters merged into the body verbatim'),
  }),
  execute: async ({
    deepseekToken,
    model,
    input,
    instructions,
    reasoning,
    maxOutputTokens,
    temperature,
    topP,
    text,
    tools,
    toolChoice,
    topLogprobs,
    user,
    safetyCheck,
    title,
    extra,
  }) => {
    if (!model) return { error: 'model is required.' };
    if (input === undefined || input === null || input === '') {
      return { error: 'input is required (a string or array of input items).' };
    }

    const result = await deepseekRequest(deepseekToken, '/responses', {
      method: 'POST',
      body: compact({
        model,
        input,
        instructions,
        reasoning,
        max_output_tokens: maxOutputTokens,
        temperature,
        top_p: topP,
        text,
        tools,
        tool_choice: toolChoice,
        top_logprobs: topLogprobs,
        user,
        safety_check: safetyCheck,
        title,
        ...(extra || {}),
      }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
