// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetMyPlaylists = tool({
  description:
    "Gets a page of the playlists in the current user's Spotify profile (both ones they own and ones they follow) as a paging object. Requires the playlist-read-private scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max playlists per page, 1-50 (default 20)'),
    offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
  }),
  execute: async ({ spotifyToken, limit, offset }) => {
    const result = await spotifyRequest(spotifyToken, '/me/playlists', {
      query: { limit, offset },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
