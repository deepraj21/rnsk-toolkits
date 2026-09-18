// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest, normalizeConferenceRecordName } from './utils.js';

export const getConferenceRecordByName = tool({
  description:
    'Get a specific conference record by its resource name. Use when you have the conference record ID and need meeting instance details.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    name: z
      .string()
      .describe("Conference record resource name (e.g. 'conferenceRecords/GLkPdCDLsjSXet2-QH9dDxIPOAIIigIgABgECA')"),
  }),
  execute: async ({ googleMeetToken, name }) => {
    try {
      const resource = normalizeConferenceRecordName(name);
      const result = await googleMeetRequest(googleMeetToken, `/${resource}`);

      if (!result.ok) {
        return { error: 'Failed to get conference record', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting conference record',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
