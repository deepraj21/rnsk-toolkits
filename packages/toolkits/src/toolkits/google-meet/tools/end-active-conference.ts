// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest, normalizeSpaceName } from './utils.js';

export const endActiveConference = tool({
  description:
    'Ends an active conference in a Google Meet space. Immediately drops all active participants — obtain explicit user confirmation before calling.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    space_name: z
      .string()
      .describe("Resource name of the space (e.g. 'spaces/jQCFfuBOdN5z' or 'jQCFfuBOdN5z')"),
  }),
  execute: async ({ googleMeetToken, space_name }) => {
    try {
      const name = normalizeSpaceName(space_name);
      const result = await googleMeetRequest(googleMeetToken, `/${name}:endActiveConference`, {
        method: 'POST',
        body: {},
      });

      if (!result.ok) {
        return { error: 'Failed to end active conference', details: result.data, statusCode: result.status };
      }

      return {
        success: true,
        message: 'Active conference ended successfully',
        data: result.data,
      };
    } catch (error) {
      return {
        error: 'Error ending active conference',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
