// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zoomRequest } from './utils.js';

export const getCurrentUser = tool({
  description:
    "Gets the connected Zoom user's profile: ID, email, timezone, personal meeting ID (PMI), and personal meeting URL. Use to confirm who is connected before scheduling.",
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    eventId: z
      .string()
      .optional()
      .describe("The user's unique identifier in double-encode format (rarely needed)"),
  }),
  execute: async ({ zoomToken, eventId }) => {
    try {
      const result = await zoomRequest(zoomToken, '/users/me', {
        query: { event_id: eventId },
      });

      if (!result.ok) {
        return { error: 'Failed to get user', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting user',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
