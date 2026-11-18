// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { deepseekRequest } from './client.js';

export const deepseekListModels = tool({
  description:
    'Lists the DeepSeek models available to your account with metadata — display name, context window, max output tokens, supported input/output modalities, reasoning effort levels, and per-protocol (OpenAI/Anthropic) API capabilities. Run this first to discover current model IDs (e.g. deepseek-flash, deepseek-v4-pro) before calling the chat, completion, message, or response tools.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
  }),
  execute: async ({ deepseekToken }) => {
    const result = await deepseekRequest(deepseekToken, '/models');
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const deepseekGetUserBalance = tool({
  description:
    "Checks the DeepSeek account balance — whether charging is currently available (is_available) plus each currency's total, granted, and topped-up balances (e.g. CNY/USD). Use it before running expensive jobs to confirm the account can spend.",
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
  }),
  execute: async ({ deepseekToken }) => {
    const result = await deepseekRequest(deepseekToken, '/user/balance');
    if (result.error) return result;

    return result.data ?? {};
  },
});
