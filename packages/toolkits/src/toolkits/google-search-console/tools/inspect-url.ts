// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { searchConsoleRequest } from './utils.js';

export const inspectUrl = tool({
  description:
    'Inspect a URL using the Google Search Console URL Inspection API. Returns indexing status and crawl details.',
  inputSchema: z.object({
    googleSearchConsoleToken: z.string().describe('The Google Search Console access token'),
    site_url: z.string().describe('The Search Console property URL that owns the page'),
    inspection_url: z.string().describe('The fully-qualified URL to inspect'),
    language_code: z
      .string()
      .optional()
      .describe('IETF BCP-47 language code for localizing results (e.g. en-US)'),
  }),
  execute: async ({ googleSearchConsoleToken, site_url, inspection_url, language_code }) => {
    try {
      const body: Record<string, string> = {
        siteUrl: site_url,
        inspectionUrl: inspection_url,
      };
      if (language_code) body.languageCode = language_code;

      const result = await searchConsoleRequest(
        googleSearchConsoleToken,
        '/urlInspection/index:inspect',
        {
          method: 'POST',
          body,
        },
      );

      if (!result.ok) {
        return { error: 'Failed to inspect URL', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error inspecting URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
