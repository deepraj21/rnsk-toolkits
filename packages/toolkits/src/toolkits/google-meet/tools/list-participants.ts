// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest, normalizeConferenceRecordName } from './utils.js';

export const listParticipants = tool({
  description: 'List participants for a conference record.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    parent: z
      .string()
      .describe("Conference record resource name (e.g. 'conferenceRecords/abc-123-def')"),
    filter: z.string().optional().describe('Optional EBNF filter expression'),
    page_size: z.number().optional().describe('Maximum number of participants to return'),
    page_token: z.string().optional().describe('Page token from a previous list call'),
  }),
  execute: async ({ googleMeetToken, parent, filter, page_size, page_token }) => {
    try {
      const resource = normalizeConferenceRecordName(parent);
      const result = await googleMeetRequest(googleMeetToken, `/${resource}/participants`, {
        query: { filter, pageSize: page_size, pageToken: page_token },
      });

      if (!result.ok) {
        return { error: 'Failed to list participants', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing participants',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
