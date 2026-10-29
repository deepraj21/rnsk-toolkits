// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeMeetingPath, zoomRequest } from './utils.js';

export const endMeeting = tool({
  description:
    'Ends a live Zoom meeting immediately for all participants. Use when the user wants to stop an in-progress call.',
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    meetingId: z.string().describe('Meeting ID (numeric string) of the meeting to end'),
  }),
  execute: async ({ zoomToken, meetingId }) => {
    try {
      const result = await zoomRequest(
        zoomToken,
        `/meetings/${encodeMeetingPath(meetingId)}/status`,
        {
          method: 'PUT',
          body: { action: 'end' },
        },
      );

      if (!result.ok) {
        return { error: 'Failed to end meeting', details: result.data, statusCode: result.status };
      }

      return { success: true, meetingId };
    } catch (error) {
      return {
        error: 'Error ending meeting',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
