// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetFollowedArtists = tool({
  description:
    'Gets a cursor-paged list of artists the user follows (max 50 per call). Returns a cursor object — pass the returned cursors.next value as `after` to fetch the next page. Requires the user-follow-read scope.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max artists per page, 1-50 (default 20)'),
    after: z
      .string()
      .optional()
      .describe('Cursor from the previous page (cursors.next) — omit for the first page'),
  }),
  execute: async ({ spotifyToken, limit, after }) => {
    const result = await spotifyRequest(spotifyToken, '/me/following', {
      query: { type: 'artist', limit, after },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
