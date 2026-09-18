// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleMeetRequest, normalizeSpaceName } from './utils.js';

export const getMeet = tool({
  description:
    'Retrieve details of a Google Meet space using its unique identifier. Newly created spaces may return incomplete data; retry after 1–3 seconds if needed.',
  inputSchema: z.object({
    googleMeetToken: z.string().describe('The Google Meet access token'),
    space_name: z
      .string()
      .describe("The Google Meet space ID without the 'spaces/' prefix (e.g. 'mV63iV9-KxoB')"),
  }),
  execute: async ({ googleMeetToken, space_name }) => {
    try {
      const name = normalizeSpaceName(space_name);
      const result = await googleMeetRequest(googleMeetToken, `/${name}`);

      if (!result.ok) {
        return { error: 'Failed to get Meet space details', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting Meet space details',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
