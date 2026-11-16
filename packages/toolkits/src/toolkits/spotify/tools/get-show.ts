// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetShow = tool({
  description:
    'Gets full Spotify catalog information for a podcast/show — title, description, publisher, total episodes, languages, available markets, and images. Accepts a bare show ID, a spotify:show: URI, or an open.spotify.com URL. Requires the user-read-playback-position scope.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z.string().min(1).describe('Show ID, spotify:show: URI, or open.spotify.com show URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts to that market'),
  }),
  execute: async ({ spotifyToken, id, market }) => {
    const showId = spotifyId(id);
    if (!showId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/shows/${showId}`, {
      query: { market },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
