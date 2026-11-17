// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetPlaylist = tool({
  description:
    'Gets full details for a single playlist — name, description, owner, visibility, collaborative flag, followers, images, and the first page of tracks. Accepts a bare playlist ID, a spotify:playlist: URI, or an open.spotify.com URL. Use spotifyGetPlaylistItems to page through all items.',
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
      .describe(
        'Comma-separated list of fields to return, e.g. "name,description,tracks.total" (default: all)',
      ),
    additionalTypes: z
      .array(z.enum(['track', 'episode']))
      .optional()
      .describe('Additional item types the client supports besides the default track type'),
  }),
  execute: async ({ spotifyToken, id, market, fields, additionalTypes }) => {
    const playlistId = spotifyId(id);
    if (!playlistId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/playlists/${playlistId}`, {
      query: {
        market,
        fields,
        additional_types:
          additionalTypes && additionalTypes.length ? additionalTypes.join(',') : undefined,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
