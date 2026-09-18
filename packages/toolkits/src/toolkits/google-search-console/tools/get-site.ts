// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeSiteUrl, webmastersRequest } from './utils.js';

export const getSite = tool({
  description: 'Retrieve metadata for a site property in Google Search Console.',
  inputSchema: z.object({
    googleSearchConsoleToken: z.string().describe('The Google Search Console access token'),
    site_url: z.string().describe('The Search Console property URL to retrieve'),
  }),
  execute: async ({ googleSearchConsoleToken, site_url }) => {
    try {
      const result = await webmastersRequest(
        googleSearchConsoleToken,
        `/sites/${encodeSiteUrl(site_url)}`,
      );

      if (!result.ok) {
        return { error: 'Failed to get site', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting site',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
