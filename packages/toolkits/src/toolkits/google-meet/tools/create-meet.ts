// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest } from './utils.js';

export const createMeet = tool({
  description:
    'Creates a new Google Meet space with optional configuration. Capture meetingUri, meetingCode, and space.name from the response for downstream lookups.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    config: z
      .record(z.unknown())
      .optional()
      .describe('Optional meeting space configuration (accessType, moderation, artifactConfig, etc.)'),
  }),
  execute: async ({ googleMeetToken, config }) => {
    try {
      const result = await googleMeetRequest(googleMeetToken, '/spaces', {
        method: 'POST',
        body: config ? { config } : {},
      });

      if (!result.ok) {
        return { error: 'Failed to create Google Meet space', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error creating Google Meet space',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
