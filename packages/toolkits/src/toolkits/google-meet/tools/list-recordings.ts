// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest, normalizeConferenceRecordName } from './utils.js';

export const listRecordings = tool({
  description: 'List recordings for a conference record.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    parent: z
      .string()
      .describe("Conference record resource name (e.g. 'conferenceRecords/abc-123-def')"),
    page_size: z.number().optional().describe('Maximum number of recordings to return'),
    page_token: z.string().optional().describe('Page token from a previous list call'),
  }),
  execute: async ({ googleMeetToken, parent, page_size, page_token }) => {
    try {
      const resource = normalizeConferenceRecordName(parent);
      const result = await googleMeetRequest(googleMeetToken, `/${resource}/recordings`, {
        query: { pageSize: page_size, pageToken: page_token },
      });

      if (!result.ok) {
        return { error: 'Failed to list recordings', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing recordings',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
