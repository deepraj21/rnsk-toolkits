// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest } from './utils.js';

export const getParticipantSession = tool({
  description:
    'Retrieves detailed information about a specific participant session from a Google Meet conference record.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    name: z
      .string()
      .describe(
        "Full resource name: 'conferenceRecords/{conference_record}/participants/{participant}/participantSessions/{participant_session}'",
      ),
  }),
  execute: async ({ googleMeetToken, name }) => {
    try {
      const result = await googleMeetRequest(googleMeetToken, `/${name}`);

      if (!result.ok) {
        return { error: 'Failed to get participant session', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting participant session',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
