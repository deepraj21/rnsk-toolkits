// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetRecentlyPlayed = tool({
  description:
    "Gets the user's recently played items (up to 50) as a cursor-paged object, most recent first. Use `after` (playback cursor) or `before` to page backwards through history. Requires the user-read-recently-played scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max play history items, 1-50 (default 20)'),
    after: z
      .number()
      .int()
      .optional()
      .describe('A unix timestamp in ms — return items played after this moment'),
    before: z
      .number()
      .int()
      .optional()
      .describe('A unix timestamp in ms — return items played before this moment'),
  }),
  execute: async ({ spotifyToken, limit, after, before }) => {
    const result = await spotifyRequest(spotifyToken, '/me/player/recently-played', {
      query: { limit, after, before },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
