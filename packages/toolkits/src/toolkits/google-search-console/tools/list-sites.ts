// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { webmastersRequest } from './utils.js';

export const listSites = tool({
  description: 'List all site properties accessible to the authenticated user in Google Search Console.',
  inputSchema: z.object({
    googleSearchConsoleToken: z.string().describe('The Google Search Console access token'),
  }),
  execute: async ({ googleSearchConsoleToken }) => {
    try {
      const result = await webmastersRequest(googleSearchConsoleToken, '/sites');

      if (!result.ok) {
        return { error: 'Failed to list sites', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing sites',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
