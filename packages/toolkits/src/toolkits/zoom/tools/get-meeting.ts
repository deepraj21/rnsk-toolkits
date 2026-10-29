// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeMeetingPath, zoomRequest } from './utils.js';

export const getMeeting = tool({
  description:
    'Gets full details of a Zoom meeting by meeting ID: topic, start time, join URL, password, agenda, and settings.',
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    meetingId: z.string().describe('Meeting ID (numeric string) or meeting UUID'),
    occurrenceId: z
      .string()
      .optional()
      .describe('Occurrence ID for recurring meetings, e.g. "1633456750000"'),
    showPreviousOccurrences: z
      .boolean()
      .optional()
      .describe('Whether to include previous occurrences of a recurring meeting'),
  }),
  execute: async ({ zoomToken, meetingId, occurrenceId, showPreviousOccurrences }) => {
    try {
      const result = await zoomRequest(zoomToken, `/meetings/${encodeMeetingPath(meetingId)}`, {
        query: {
          occurrence_id: occurrenceId,
          show_previous_occurrences: showPreviousOccurrences,
        },
      });

      if (!result.ok) {
        return { error: 'Failed to get meeting', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting meeting',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
