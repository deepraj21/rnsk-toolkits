// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeMeetingPath, zoomRequest } from './utils.js';

export const updateMeeting = tool({
  description:
    'Updates a Zoom meeting — change topic, start time, duration, timezone, agenda, or settings. Use to reschedule or rename an existing meeting. Only provided fields are changed.',
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    meetingId: z.string().describe('Meeting ID (numeric string) or meeting UUID'),
    topic: z.string().optional().describe('New meeting title'),
    startTime: z
      .string()
      .optional()
      .describe(
        'New start time as yyyy-MM-ddTHH:mm:ss (local, use with timezone) or yyyy-MM-ddTHH:mm:ssZ (UTC)',
      ),
    duration: z.number().optional().describe('New duration in minutes'),
    timezone: z.string().optional().describe('IANA timezone for start_time, e.g. "Europe/Berlin"'),
    agenda: z.string().optional().describe('New meeting agenda'),
    settings: z
      .record(z.any())
      .optional()
      .describe('Zoom settings object to merge, e.g. {"auto_recording":"local"}'),
  }),
  execute: async ({
    zoomToken,
    meetingId,
    topic,
    startTime,
    duration,
    timezone,
    agenda,
    settings,
  }) => {
    try {
      const body: Record<string, unknown> = {};
      if (topic !== undefined) body.topic = topic;
      if (startTime !== undefined) body.start_time = startTime;
      if (duration !== undefined) body.duration = duration;
      if (timezone !== undefined) body.timezone = timezone;
      if (agenda !== undefined) body.agenda = agenda;
      if (settings !== undefined) body.settings = settings;

      const result = await zoomRequest(zoomToken, `/meetings/${encodeMeetingPath(meetingId)}`, {
        method: 'PATCH',
        body,
      });

      if (!result.ok) {
        return {
          error: 'Failed to update meeting',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error updating meeting',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
