import { tool } from 'ai';
import { z } from 'zod';
import { createFirecrawlClient, extractSnippet } from './firecrawl-client.js';

export const webScrape = tool({
  description:
    'Scrape a specific URL and return its page content as markdown. Use this when you already have a URL and need the full page text.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to scrape'),
  }),
  execute: async ({ url }) => {
    try {
      const firecrawl = createFirecrawlClient();
      const document = await firecrawl.scrape(url, { formats: ['markdown', 'html'] });

      const record = document as Record<string, unknown>;
      const markdown =
        typeof record.markdown === 'string' ? record.markdown.trim() : extractSnippet(record);

      return {
        url,
        title: typeof record.title === 'string' ? record.title : '',
        markdown,
        snippet: markdown.slice(0, 500),
      };
    } catch (err) {
      return {
        error: 'Web scrape failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
