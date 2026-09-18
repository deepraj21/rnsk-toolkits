// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest, normalizeConferenceRecordName } from './utils.js';

export const listParticipantSessions = tool({
  description: 'List participant sessions for a participant within a conference record.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    conference_record_id: z.string().describe('Unique identifier of the conference record'),
    participant_id: z.string().describe('Unique identifier of the participant within the conference'),
    filter: z.string().optional().describe('Optional EBNF filter expression'),
    page_size: z.number().optional().describe('Maximum number of participant sessions to return'),
    page_token: z.string().optional().describe('Page token from a previous list call'),
  }),
  execute: async ({ googleMeetToken, conference_record_id, participant_id, filter, page_size, page_token }) => {
    try {
      const parent = `${normalizeConferenceRecordName(conference_record_id)}/participants/${participant_id}`;
      const result = await googleMeetRequest(googleMeetToken, `/${parent}/participantSessions`, {
        query: { filter, pageSize: page_size, pageToken: page_token },
      });

      if (!result.ok) {
        return { error: 'Failed to list participant sessions', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing participant sessions',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
