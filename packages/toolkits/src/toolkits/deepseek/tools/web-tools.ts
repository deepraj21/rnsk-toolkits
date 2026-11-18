// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { deepseekRequest } from './client.js';

export const deepseekFetchUrl = tool({
  description:
    'Fetches one web page and returns its title plus full content as Markdown — use it to read an article, doc page, or any HTTP(S) URL the model (or you) needs the text of. Prefer this over search when the exact URL is already known; pair with deepseekWebSearch to first find the URL. Billed per fetch; content comes back trimmed to an excerpt for long pages.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    url: z
      .string()
      .min(1)
      .max(8192)
      .describe(
        'HTTP(S) URL to fetch, e.g. "https://example.com/article" (no userinfo in the URL)',
      ),
  }),
  execute: async ({ deepseekToken, url }) => {
    if (!url) return { error: 'url is required.' };
    if (!/^https?:\/\//i.test(url)) return { error: 'url must start with http:// or https://.' };

    const result = await deepseekRequest(deepseekToken, '/v1/tools/fetch', {
      method: 'POST',
      body: { url },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const deepseekWebSearch = tool({
  description:
    'Runs a web search and returns ranked results with title, URL, snippet, summary, and rerank score (optionally full page content). Supports search operators like site:, -site:, and "quoted phrases". Use it to ground answers in current events or to find pages for deepseekFetchUrl to read afterwards.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    query: z
      .string()
      .min(1)
      .max(128)
      .describe(
        'Search query (1-128 chars), supports operators like site:example.com and -site:example.com',
      ),
    count: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Number of results to return (1-50, default 10)'),
    originalQuestion: z
      .string()
      .max(128)
      .optional()
      .describe(
        "The user's original question that triggered the search — improves query understanding",
      ),
    localization: z
      .string()
      .optional()
      .describe('IP address used to localize results (defaults to none)'),
    needContent: z
      .boolean()
      .optional()
      .describe("Also return each page's content (default false — content then comes back empty)"),
  }),
  execute: async ({ deepseekToken, query, count, originalQuestion, localization, needContent }) => {
    if (!query) return { error: 'query is required.' };

    const result = await deepseekRequest(deepseekToken, '/v1/tools/search', {
      method: 'POST',
      body: {
        query,
        count,
        ori_question: originalQuestion,
        localization,
        need_content: needContent,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
