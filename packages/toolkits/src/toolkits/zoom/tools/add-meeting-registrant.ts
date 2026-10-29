// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeMeetingPath, zoomRequest } from './utils.js';

export const addMeetingRegistrant = tool({
  description:
    'Registers an attendee for a Zoom meeting with registration enabled and returns their unique join URL. Use to sign up an invitee by email; requires a licensed host and registration on the meeting.',
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    meetingId: z.string().describe('Meeting ID (numeric string) or meeting UUID'),
    email: z.string().email().describe('Registrant email address'),
    firstName: z.string().describe('Registrant first name'),
    lastName: z.string().describe('Registrant last name'),
  }),
  execute: async ({ zoomToken, meetingId, email, firstName, lastName }) => {
    try {
      const result = await zoomRequest(
        zoomToken,
        `/meetings/${encodeMeetingPath(meetingId)}/registrants`,
        {
          method: 'POST',
          body: { first_name: firstName, last_name: lastName, email },
        },
      );

      if (!result.ok) {
        return {
          error: 'Failed to add meeting registrant',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error adding meeting registrant',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
