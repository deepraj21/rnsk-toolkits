// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeMeetingPath, zoomRequest } from './utils.js';

export const deleteMeeting = tool({
  description:
    'Deletes a scheduled Zoom meeting permanently. Use only when the user explicitly asks to cancel or remove a meeting.',
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    meetingId: z.string().describe('Meeting ID (numeric string) or meeting UUID'),
    occurrenceId: z
      .string()
      .optional()
      .describe('Occurrence ID to delete only one occurrence of a recurring meeting'),
  }),
  execute: async ({ zoomToken, meetingId, occurrenceId }) => {
    try {
      const result = await zoomRequest(zoomToken, `/meetings/${encodeMeetingPath(meetingId)}`, {
        method: 'DELETE',
        query: { occurrence_id: occurrenceId },
      });

      if (!result.ok) {
        return {
          error: 'Failed to delete meeting',
          details: result.data,
          statusCode: result.status,
        };
      }

      return { success: true, meetingId };
    } catch (error) {
      return {
        error: 'Error deleting meeting',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
