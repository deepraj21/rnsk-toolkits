// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeSiteUrl, webmastersRequest } from './utils.js';

export const addSite = tool({
  description:
    'Add a site property to Google Search Console. For URL-prefix properties use the full URL with trailing slash.',
  inputSchema: z.object({
    googleSearchConsoleToken: z.string().describe('The Google Search Console access token'),
    site_url: z.string().describe('The site URL to add (e.g. https://www.example.com/ or sc-domain:example.com)'),
  }),
  execute: async ({ googleSearchConsoleToken, site_url }) => {
    try {
      const result = await webmastersRequest(
        googleSearchConsoleToken,
        `/sites/${encodeSiteUrl(site_url)}`,
        { method: 'PUT' },
      );

      if (!result.ok) {
        return { error: 'Failed to add site', details: result.data, statusCode: result.status };
      }

      return { success: true, site_url, data: result.data };
    } catch (error) {
      return {
        error: 'Error adding site',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
