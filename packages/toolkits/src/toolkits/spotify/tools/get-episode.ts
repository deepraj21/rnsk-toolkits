// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetEpisode = tool({
  description:
    'Gets full Spotify catalog information for a single podcast episode — title, description, audio (duration/preview), show it belongs to, release date, and images. Accepts a bare episode ID, a spotify:episode: URI, or an open.spotify.com URL. Requires the user-read-playback-position scope.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Episode ID, spotify:episode: URI, or open.spotify.com episode URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts to that market'),
  }),
  execute: async ({ spotifyToken, id, market }) => {
    const episodeId = spotifyId(id);
    if (!episodeId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/episodes/${episodeId}`, {
      query: { market },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
