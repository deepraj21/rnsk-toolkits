// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest } from './utils.js';

export const listConferenceRecords = tool({
  description: 'List conference records with optional filtering and pagination.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    filter: z.string().optional().describe('Optional EBNF filter expression'),
    page_size: z.number().optional().describe('Maximum number of conference records to return'),
    page_token: z.string().optional().describe('Page token from a previous list call'),
  }),
  execute: async ({ googleMeetToken, filter, page_size, page_token }) => {
    try {
      const result = await googleMeetRequest(googleMeetToken, '/conferenceRecords', {
        query: { filter, pageSize: page_size, pageToken: page_token },
      });

      if (!result.ok) {
        return { error: 'Failed to list conference records', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error listing conference records',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
