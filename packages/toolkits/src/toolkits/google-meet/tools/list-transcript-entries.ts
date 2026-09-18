// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest, normalizeConferenceRecordName } from './utils.js';

export const listTranscriptEntries = tool({
  description: 'List transcript entries for a transcript within a conference record.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    conference_record_id: z.string().describe('Unique identifier of the conference record'),
    transcript_id: z.string().describe('Unique identifier of the transcript within the conference record'),
    page_size: z.number().optional().describe('Maximum number of transcript entries to return'),
    page_token: z.string().optional().describe('Page token from a previous list call'),
  }),
  execute: async ({ googleMeetToken, conference_record_id, transcript_id, page_size, page_token }) => {
    try {
      const parent = `${normalizeConferenceRecordName(conference_record_id)}/transcripts/${transcript_id}`;
      const result = await googleMeetRequest(googleMeetToken, `/${parent}/entries`, {
        query: { pageSize: page_size, pageToken: page_token },
      });

      if (!result.ok) {
        return { error: 'Failed to list transcript entries', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing transcript entries',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
