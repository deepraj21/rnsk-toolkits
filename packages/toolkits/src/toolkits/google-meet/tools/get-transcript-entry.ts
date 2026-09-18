// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest } from './utils.js';

export const getTranscriptEntry = tool({
  description: 'Get a specific transcript entry by its full resource name.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    name: z
      .string()
      .describe(
        "Transcript entry resource name: 'conferenceRecords/{conference_record}/transcripts/{transcript}/entries/{entry}'",
      ),
  }),
  execute: async ({ googleMeetToken, name }) => {
    try {
      const result = await googleMeetRequest(googleMeetToken, `/${name}`);

      if (!result.ok) {
        return { error: 'Failed to get transcript entry', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting transcript entry',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
