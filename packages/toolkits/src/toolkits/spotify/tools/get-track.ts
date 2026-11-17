// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetTrack = tool({
  description:
    'Gets full Spotify catalog information for a single track — name, artists, album, duration, popularity, explicit flag, available markets, and external URLs. Accepts a bare track ID, a spotify:track: URI, or an open.spotify.com URL.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z.string().min(1).describe('Track ID, spotify:track: URI, or open.spotify.com track URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts available markets to that country'),
  }),
  execute: async ({ spotifyToken, id, market }) => {
    const trackId = spotifyId(id);
    if (!trackId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/tracks/${trackId}`, {
      query: { market },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
