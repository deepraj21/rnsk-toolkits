// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeMeetingPath, zoomRequest } from './utils.js';

export const deleteMeetingRecordings = tool({
  description:
    "Deletes a meeting's cloud recordings — moves them to trash (default) or erases them permanently. Use action 'delete' only when the user explicitly asks to permanently erase recordings.",
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    meetingId: z
      .string()
      .describe('Meeting ID (numeric string) or meeting UUID of the recorded instance'),
    action: z
      .enum(['trash', 'delete'])
      .optional()
      .describe('trash (default) moves recordings to trash; delete erases them permanently'),
  }),
  execute: async ({ zoomToken, meetingId, action }) => {
    try {
      const result = await zoomRequest(
        zoomToken,
        `/meetings/${encodeMeetingPath(meetingId)}/recordings`,
        {
          method: 'DELETE',
          query: { action },
        },
      );

      if (!result.ok) {
        return {
          error: 'Failed to delete meeting recordings',
          details: result.data,
          statusCode: result.status,
        };
      }

      return { success: true, meetingId };
    } catch (error) {
      return {
        error: 'Error deleting meeting recordings',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
