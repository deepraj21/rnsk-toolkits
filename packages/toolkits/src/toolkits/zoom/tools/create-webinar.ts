// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zoomRequest } from './utils.js';

export const createWebinar = tool({
  description:
    'Schedules a Zoom webinar for the connected webinar host and returns the webinar ID and join/registration URL. Requires a webinar-licensed Zoom user.',
  inputSchema: z.object({
    zoomToken: z.string().describe('The Zoom access token'),
    topic: z.string().describe('Webinar title, e.g. "Product launch"'),
    type: z
      .number()
      .optional()
      .describe(
        '1 = webinar, 5 = webinar with fixed time (default), 6 = recurring webinar with fixed time',
      ),
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
    agenda: z.string().optional().describe('Webinar description / agenda'),
    settings: z
      .record(z.any())
      .optional()
      .describe('Webinar settings object, e.g. {"approval_type":0,"auto_recording":"cloud"}'),
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

      const result = await zoomRequest(zoomToken, '/users/me/webinars', {
        method: 'POST',
        body,
      });

      if (!result.ok) {
        return {
          error: 'Failed to create webinar',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error creating webinar',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
