// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetAudiobookChapters = tool({
  description:
    "Gets a page of an audiobook's chapters (simplified chapter objects) as a paging object. Page with limit/offset.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Audiobook ID, spotify:audiobook: URI, or open.spotify.com audiobook URL'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts chapters to those available there'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max chapters per page, 1-50 (default 20)'),
    offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
  }),
  execute: async ({ spotifyToken, id, market, limit, offset }) => {
    const audiobookId = spotifyId(id);
    if (!audiobookId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/audiobooks/${audiobookId}/chapters`, {
      query: { market, limit, offset },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
