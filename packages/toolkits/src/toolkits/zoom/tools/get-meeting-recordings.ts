// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeMeetingPath, zoomRequest } from './utils.js';

export const getMeetingRecordings = tool({
  description:
    "Gets cloud recordings for a Zoom meeting or meeting UUID: recording files, download URLs, and share link. Use to retrieve a past meeting's recording.",
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    meetingId: z
      .string()
      .describe('Meeting ID (numeric string) or meeting UUID of the recorded instance'),
    trashType: z
      .string()
      .optional()
      .describe(
        'Filter recording files: all (default), meeting, or shared_screen_with_speaker_view (etc.)',
      ),
    pageSize: z.number().optional().describe('Maximum results per page (default 30)'),
    pageNumber: z.number().optional().describe('Page number for pagination (default 1)'),
  }),
  execute: async ({ zoomToken, meetingId, trashType, pageSize, pageNumber }) => {
    try {
      const result = await zoomRequest(
        zoomToken,
        `/meetings/${encodeMeetingPath(meetingId)}/recordings`,
        {
          query: { trash_type: trashType, page_size: pageSize, page_number: pageNumber },
        },
      );

      if (!result.ok) {
        return {
          error: 'Failed to get meeting recordings',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting meeting recordings',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
