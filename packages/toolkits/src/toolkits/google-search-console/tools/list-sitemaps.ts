// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeSiteUrl, webmastersRequest } from './utils.js';

export const listSitemaps = tool({
  description: 'List sitemaps submitted for a site in Google Search Console.',
  inputSchema: z.object({
    googleSearchConsoleToken: z.string().describe('The Google Search Console access token'),
    site_url: z.string().describe('The site URL including protocol'),
    sitemap_index: z
      .string()
      .optional()
      .describe('Optional sitemap index URL to list child sitemaps from'),
  }),
  execute: async ({ googleSearchConsoleToken, site_url, sitemap_index }) => {
    try {
      const result = await webmastersRequest(
        googleSearchConsoleToken,
        `/sites/${encodeSiteUrl(site_url)}/sitemaps`,
        { query: { sitemapIndex: sitemap_index } },
      );

      if (!result.ok) {
        return { error: 'Failed to list sitemaps', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing sitemaps',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
