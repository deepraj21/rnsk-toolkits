// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zoomRequest } from './utils.js';

export const listMeetings = tool({
  description:
    "Lists the connected user's Zoom meetings (scheduled, upcoming, or live) with pagination. Use to find upcoming calls and their join links.",
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    type: z
      .string()
      .optional()
      .describe(
        'Meeting type filter: scheduled (default), upcoming, live, upcoming_meetings, or pmm',
      ),
    pageSize: z.number().optional().describe('Maximum results per page (max 300, default 30)'),
    pageNumber: z.number().optional().describe('Page number for pagination (default 1)'),
  }),
  execute: async ({ zoomToken, type, pageSize, pageNumber }) => {
    try {
      const result = await zoomRequest(zoomToken, '/users/me/meetings', {
        query: { type, page_size: pageSize, page_number: pageNumber },
      });

      if (!result.ok) {
        return {
          error: 'Failed to list meetings',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing meetings',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
