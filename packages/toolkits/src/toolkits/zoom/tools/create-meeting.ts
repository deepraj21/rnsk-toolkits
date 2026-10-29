// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zoomRequest } from './utils.js';

export const createMeeting = tool({
  description:
    'Creates a Zoom meeting for the connected user and returns the meeting ID, join URL, and start time. Use to schedule a new meeting.',
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    topic: z.string().describe('Meeting title, e.g. "Weekly sync"'),
    type: z
      .number()
      .optional()
      .describe('1 = instant meeting, 2 = scheduled (default), 3 = recurring with fixed time'),
    startTime: z
      .string()
      .optional()
      .describe(
        'Start time as yyyy-MM-ddTHH:mm:ss (local, use with timezone) or yyyy-MM-ddTHH:mm:ssZ (UTC)',
      ),
    duration: z.number().optional().describe('Duration in minutes (default 60)'),
    timezone: z
      .string()
      .optional()
      .describe('IANA timezone for start_time, e.g. "America/New_York"'),
    agenda: z.string().optional().describe('Meeting description / agenda'),
    settings: z
      .record(z.any())
      .optional()
      .describe(
        'Zoom settings object, e.g. {"auto_recording":"cloud","join_before_host":true,"waiting_room":false}',
      ),
  }),
  execute: async ({ zoomToken, topic, type, startTime, duration, timezone, agenda, settings }) => {
    try {
      const body: Record<string, unknown> = { topic };
      if (type !== undefined) body.type = type;
      if (startTime !== undefined) body.start_time = startTime;
      if (duration !== undefined) body.duration = duration;
      if (timezone !== undefined) body.timezone = timezone;
      if (agenda !== undefined) body.agenda = agenda;
      if (settings !== undefined) body.settings = settings;

      const result = await zoomRequest(zoomToken, '/users/me/meetings', {
        method: 'POST',
        body,
      });

      if (!result.ok) {
        return {
          error: 'Failed to create meeting',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error creating meeting',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
