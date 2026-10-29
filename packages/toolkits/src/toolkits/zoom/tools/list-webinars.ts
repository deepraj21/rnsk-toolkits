// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zoomRequest } from './utils.js';

export const listWebinars = tool({
  description:
    "Lists the connected user's Zoom webinars (scheduled, upcoming, or live) with pagination. Use when managing webinars rather than regular meetings.",
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    type: z
      .string()
      .optional()
      .describe('Webinar type filter: scheduled (default), upcoming, or live'),
    pageSize: z.number().optional().describe('Maximum results per page (max 300, default 30)'),
    pageNumber: z.number().optional().describe('Page number for pagination (default 1)'),
  }),
  execute: async ({ zoomToken, type, pageSize, pageNumber }) => {
    try {
      const result = await zoomRequest(zoomToken, '/users/me/webinars', {
        query: { type, page_size: pageSize, page_number: pageNumber },
      });

      if (!result.ok) {
        return {
          error: 'Failed to list webinars',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing webinars',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
