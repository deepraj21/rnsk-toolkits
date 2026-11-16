// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetAlbum = tool({
  description:
    'Gets full Spotify catalog information for a single album — title, artists, release date, tracks (first page), label, copyrights, and images. Accepts a bare album ID, a spotify:album: URI, or an open.spotify.com URL. Use spotifyGetAlbumTracks to page through the full track list.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z.string().min(1).describe('Album ID, spotify:album: URI, or open.spotify.com album URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts tracks to those available there'),
  }),
  execute: async ({ spotifyToken, id, market }) => {
    const albumId = spotifyId(id);
    if (!albumId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/albums/${albumId}`, {
      query: { market },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
