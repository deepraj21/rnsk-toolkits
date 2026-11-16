// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetAlbumTracks = tool({
  description:
    "Gets a page of a single album's tracks (simplified track objects) as a paging object. Use limit/offset to page through the album; albums can hold up to ~50 tracks per page.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z.string().min(1).describe('Album ID, spotify:album: URI, or open.spotify.com album URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts tracks to those available there'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max tracks per page, 1-50 (default 20)'),
    offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
  }),
  execute: async ({ spotifyToken, id, market, limit, offset }) => {
    const albumId = spotifyId(id);
    if (!albumId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/albums/${albumId}/tracks`, {
      query: { market, limit, offset },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
