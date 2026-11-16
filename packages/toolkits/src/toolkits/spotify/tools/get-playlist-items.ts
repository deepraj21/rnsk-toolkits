// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetPlaylistItems = tool({
  description:
    "Gets a page of a playlist's items (tracks and/or episodes) as a paging object — sorted the way the playlist is ordered. Page with limit/offset; use `fields` to trim the response. Requires the playlist-read-private scope for private playlists.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Playlist ID, spotify:playlist: URI, or open.spotify.com playlist URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts tracks to those available there'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated list of fields to return, e.g. "items,next,total" (default: all)'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max items per page, 1-50 (default 20)'),
    offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
    additionalTypes: z
      .array(z.enum(['track', 'episode']))
      .optional()
      .describe('Additional item types the client supports besides the default track type'),
  }),
  execute: async ({ spotifyToken, id, market, fields, limit, offset, additionalTypes }) => {
    const playlistId = spotifyId(id);
    if (!playlistId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/playlists/${playlistId}/items`, {
      query: {
        market,
        fields,
        limit,
        offset,
        additional_types:
          additionalTypes && additionalTypes.length ? additionalTypes.join(',') : undefined,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
