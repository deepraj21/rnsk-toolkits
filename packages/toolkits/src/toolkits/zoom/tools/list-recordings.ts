// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zoomRequest } from './utils.js';

export const listRecordings = tool({
  description:
    "Lists the connected user's cloud recordings across meetings within a date range (defaults to the last 30 days). Use to find recorded sessions and their download URLs.",
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    fromDate: z
      .string()
      .optional()
      .describe('Start date yyyy-MM-dd (max 30-day range; default 30 days before to date)'),
    toDate: z.string().optional().describe('End date yyyy-MM-dd (default today)'),
    pageSize: z.number().optional().describe('Maximum results per page (default 30)'),
    pageNumber: z.number().optional().describe('Page number for pagination (default 1)'),
    trash: z.boolean().optional().describe('Include recordings in trash'),
  }),
  execute: async ({ zoomToken, fromDate, toDate, pageSize, pageNumber, trash }) => {
    try {
      const result = await zoomRequest(zoomToken, '/users/me/recordings', {
        query: {
          from: fromDate,
          to: toDate,
          page_size: pageSize,
          page_number: pageNumber,
          trash,
        },
      });

      if (!result.ok) {
        return {
          error: 'Failed to list recordings',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing recordings',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
