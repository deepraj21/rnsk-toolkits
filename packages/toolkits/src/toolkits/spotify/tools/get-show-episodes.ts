// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetShowEpisodes = tool({
  description:
    "Gets a page of a podcast/show's episodes (simplified episode objects) as a paging object. Page with limit/offset. Requires the user-read-playback-position scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z.string().min(1).describe('Show ID, spotify:show: URI, or open.spotify.com show URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts episodes to those available there'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max episodes per page, 1-50 (default 20)'),
    offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
  }),
  execute: async ({ spotifyToken, id, market, limit, offset }) => {
    const showId = spotifyId(id);
    if (!showId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/shows/${showId}/episodes`, {
      query: { market, limit, offset },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
