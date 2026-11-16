// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetChapter = tool({
  description:
    'Gets full Spotify catalog information for a single audiobook chapter — title, chapter number, start/end position, duration, and its audiobook. Accepts a bare chapter ID, a spotify:chapter: URI, or an open.spotify.com URL.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Chapter ID, spotify:chapter: URI, or open.spotify.com chapter URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts to that market'),
  }),
  execute: async ({ spotifyToken, id, market }) => {
    const chapterId = spotifyId(id);
    if (!chapterId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/chapters/${chapterId}`, {
      query: { market },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
