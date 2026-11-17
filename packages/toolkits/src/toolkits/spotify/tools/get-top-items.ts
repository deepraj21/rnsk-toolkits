// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetTopItems = tool({
  description:
    "Gets the user's top artists or top tracks over a time range (their most-played content) as a paging object. Requires the user-top-read scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    type: z.enum(['artists', 'tracks']).describe('Whether to return top artists or top tracks'),
    timeRange: z
      .enum(['short_term', 'medium_term', 'long_term'])
      .optional()
      .describe(
        'Time window: short_term (~last 4 weeks), medium_term (~last 6 months, default), long_term (all time)',
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max items per page, 1-50 (default 20)'),
    offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
  }),
  execute: async ({ spotifyToken, type, timeRange, limit, offset }) => {
    if (!type) return { error: 'type is required (artists or tracks).' };

    const result = await spotifyRequest(spotifyToken, `/me/top/${type}`, {
      query: { time_range: timeRange, limit, offset },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
