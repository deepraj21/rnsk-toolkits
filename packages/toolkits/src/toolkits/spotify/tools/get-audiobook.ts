// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetAudiobook = tool({
  description:
    'Gets full Spotify catalog information for a single audiobook — title, authors, narrators, chapters (first page), publisher, languages, and images. Accepts a bare audiobook ID, a spotify:audiobook: URI, or an open.spotify.com URL.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Audiobook ID, spotify:audiobook: URI, or open.spotify.com audiobook URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts to that market'),
  }),
  execute: async ({ spotifyToken, id, market }) => {
    const audiobookId = spotifyId(id);
    if (!audiobookId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/audiobooks/${audiobookId}`, {
      query: { market },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
