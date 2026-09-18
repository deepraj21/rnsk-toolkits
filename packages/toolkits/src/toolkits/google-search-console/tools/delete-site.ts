// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeSiteUrl, webmastersRequest } from './utils.js';

export const deleteSite = tool({
  description: 'Remove a site property from Google Search Console.',
  inputSchema: z.object({
    googleSearchConsoleToken: z.string().describe('The Google Search Console access token'),
    site_url: z.string().describe('The site URL to remove from Search Console'),
  }),
  execute: async ({ googleSearchConsoleToken, site_url }) => {
    try {
      const result = await webmastersRequest(
        googleSearchConsoleToken,
        `/sites/${encodeSiteUrl(site_url)}`,
        { method: 'DELETE' },
      );

      if (!result.ok) {
        return { error: 'Failed to delete site', details: result.data, statusCode: result.status };
      }

      return { success: true, site_url };
    } catch (error) {
      return {
        error: 'Error deleting site',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
