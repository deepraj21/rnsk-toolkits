// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeFeedpath, encodeSiteUrl, webmastersRequest } from './utils.js';

export const getSitemap = tool({
  description: 'Retrieve information about a specific sitemap submitted for a site.',
  inputSchema: z.object({
    googleSearchConsoleToken: z.string().describe('The Google Search Console access token'),
    site_url: z.string().describe('The site URL including protocol (e.g. https://www.example.com/)'),
    feedpath: z.string().describe('The URL of the sitemap (e.g. https://www.example.com/sitemap.xml)'),
  }),
  execute: async ({ googleSearchConsoleToken, site_url, feedpath }) => {
    try {
      const result = await webmastersRequest(
        googleSearchConsoleToken,
        `/sites/${encodeSiteUrl(site_url)}/sitemaps/${encodeFeedpath(feedpath)}`,
      );

      if (!result.ok) {
        return { error: 'Failed to get sitemap', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting sitemap',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
