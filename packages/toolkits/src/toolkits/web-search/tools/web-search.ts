import { tool } from 'ai';
import { z } from 'zod';
import { createFirecrawlClient, extractSnippet } from './firecrawl-client.js';

type WebSearchResult = {
  title: string;
  url: string;
  snippet: string;
};

function mapSearchEntry(entry: unknown): WebSearchResult | null {
  if (!entry || typeof entry !== 'object') return null;

  const record = entry as Record<string, unknown>;
  const url = typeof record.url === 'string' ? record.url : '';
  if (!url) return null;

  return {
    title: typeof record.title === 'string' ? record.title : '',
    url,
    snippet: extractSnippet(record),
  };
}

export const webSearch = tool({
  description:
    'Search the web for current information. Use this when you need up-to-date facts, news, or general web results. Returns a list of results with title, url, and snippet.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    maxResults: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .default(5)
      .describe('Maximum number of results to return (1-20, default 5)'),
  }),
  execute: async ({ query, maxResults = 5 }) => {
    try {
      const firecrawl = createFirecrawlClient();
      const response = await firecrawl.search(query, {
        limit: maxResults,
        scrapeOptions: { formats: ['markdown'] },
      });

      const webEntries = response.web ?? [];
      const results = webEntries
        .map((entry) => mapSearchEntry(entry))
        .filter((entry): entry is WebSearchResult => entry != null);

      return { query, count: results.length, results };
    } catch (err) {
      return {
        error: 'Web search failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
