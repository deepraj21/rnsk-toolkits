// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest, normalizeConferenceRecordName } from './utils.js';

export const getRecordingsByConferenceRecordId = tool({
  description: 'Get recordings for a conference record by its unique identifier.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    conference_record_id: z.string().describe('Unique identifier for the conference record'),
    page_size: z.number().optional().describe('Maximum number of recordings to return'),
    page_token: z.string().optional().describe('Page token from a previous list call'),
  }),
  execute: async ({ googleMeetToken, conference_record_id, page_size, page_token }) => {
    try {
      const parent = normalizeConferenceRecordName(conference_record_id);
      const result = await googleMeetRequest(googleMeetToken, `/${parent}/recordings`, {
        query: { pageSize: page_size, pageToken: page_token },
      });

      if (!result.ok) {
        return { error: 'Failed to get recordings', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting recordings',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
