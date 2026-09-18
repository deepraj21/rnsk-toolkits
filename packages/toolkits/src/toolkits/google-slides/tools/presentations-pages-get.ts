// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slidesRequest } from './utils.js';

export const presentationsPagesGet = tool({
  description: 'Retrieve a specific page (slide) from a Google Slides presentation.',
  inputSchema: z.object({
    googleSlidesToken: z.string().describe('The Google Slides access token'),
    presentationId: z.string().describe('The ID of the presentation'),
    pageObjectId: z.string().describe('The object ID of the page to retrieve'),
  }),
  execute: async ({ googleSlidesToken, presentationId, pageObjectId }) => {
    try {
      const result = await slidesRequest(
        googleSlidesToken,
        `/presentations/${presentationId}/pages/${pageObjectId}`,
      );

      if (!result.ok) {
        return { error: 'Failed to get presentation page', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting presentation page',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
