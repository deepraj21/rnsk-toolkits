// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeMeetingPath, zoomRequest } from './utils.js';

export const listMeetingRegistrants = tool({
  description:
    'Lists registrants of a Zoom meeting that has registration enabled, filtered by approval status (approved, pending, or denied).',
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    meetingId: z.string().describe('Meeting ID (numeric string) or meeting UUID'),
    status: z.string().optional().describe('Filter: approved (default), pending, or denied'),
    pageSize: z.number().optional().describe('Maximum results per page (max 300, default 30)'),
    pageNumber: z.number().optional().describe('Page number for pagination (default 1)'),
  }),
  execute: async ({ zoomToken, meetingId, status, pageSize, pageNumber }) => {
    try {
      const result = await zoomRequest(
        zoomToken,
        `/meetings/${encodeMeetingPath(meetingId)}/registrants`,
        {
          query: { status, page_size: pageSize, page_number: pageNumber },
        },
      );

      if (!result.ok) {
        return {
          error: 'Failed to list meeting registrants',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing meeting registrants',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
