// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeFeedpath, encodeSiteUrl, webmastersRequest } from './utils.js';

export const submitSitemap = tool({
  description: 'Submit a sitemap URL to Google Search Console for a site property.',
  inputSchema: z.object({
    googleSearchConsoleToken: z.string().describe('The Google Search Console access token'),
    site_url: z.string().describe('The site URL as registered in Search Console'),
    feedpath: z.string().describe('The full URL of the sitemap to submit'),
  }),
  execute: async ({ googleSearchConsoleToken, site_url, feedpath }) => {
    try {
      const result = await webmastersRequest(
        googleSearchConsoleToken,
        `/sites/${encodeSiteUrl(site_url)}/sitemaps/${encodeFeedpath(feedpath)}`,
        { method: 'PUT' },
      );

      if (!result.ok) {
        return { error: 'Failed to submit sitemap', details: result.data, statusCode: result.status };
      }

      return { success: true, site_url, feedpath, data: result.data };
    } catch (error) {
      return {
        error: 'Error submitting sitemap',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
