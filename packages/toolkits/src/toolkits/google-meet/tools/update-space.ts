// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest, normalizeSpaceName } from './utils.js';

export const updateSpace = tool({
  description:
    'Update configuration settings for an existing Google Meet space. Provide updateMask to specify which fields to change.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    name: z
      .string()
      .describe("Google Meet space resource name (e.g. 'spaces/jQCFfuBOdN5z' or 'jQCFfuBOdN5z')"),
    config: z
      .record(z.unknown())
      .optional()
      .describe('Configuration settings to update for the meeting space'),
    updateMask: z
      .string()
      .optional()
      .describe('Comma-separated list of fully qualified field paths to update'),
  }),
  execute: async ({ googleMeetToken, name, config, updateMask }) => {
    try {
      const resource = normalizeSpaceName(name);
      const result = await googleMeetRequest(googleMeetToken, `/${resource}`, {
        method: 'PATCH',
        body: config ? { config } : {},
        query: updateMask ? { updateMask } : {},
      });

      if (!result.ok) {
        return { error: 'Failed to update Google Meet space', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error updating Google Meet space',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
