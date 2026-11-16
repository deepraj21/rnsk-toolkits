// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetArtist = tool({
  description:
    'Gets full Spotify catalog information for a single artist — name, genres, popularity, followers, images, and external URLs. Accepts a bare artist ID, a spotify:artist: URI, or an open.spotify.com URL.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Artist ID, spotify:artist: URI, or open.spotify.com artist URL'),
  }),
  execute: async ({ spotifyToken, id }) => {
    const artistId = spotifyId(id);
    if (!artistId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/artists/${artistId}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
