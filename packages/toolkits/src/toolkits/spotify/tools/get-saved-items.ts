// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetSavedItems = tool({
  description:
    "Gets the user's saved (\"Liked\") library items — tracks, albums, shows, episodes, or audiobooks — as a paging object, most recently saved first. Requires the user-library-read scope (episodes also need user-read-playback-position).",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    type: z
      .enum(['track', 'album', 'show', 'episode', 'audiobook'])
      .optional()
      .describe('Which library to list (default "track")'),
    market: z
      .string()
      .optional()
      .describe(
        'ISO 3166-1 alpha-2 country code (only applies to track, album, and episode results)',
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max items per page, 1-50 (default 20)'),
    offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
  }),
  execute: async ({ spotifyToken, type, market, limit, offset }) => {
    const kind = type ?? 'track';
    const path =
      kind === 'track'
        ? '/me/tracks'
        : kind === 'album'
          ? '/me/albums'
          : kind === 'show'
            ? '/me/shows'
            : kind === 'episode'
              ? '/me/episodes'
              : '/me/audiobooks';

    // Shows and audiobooks don't accept a market param.
    const supportsMarket = kind === 'track' || kind === 'album' || kind === 'episode';
    const result = await spotifyRequest(spotifyToken, path, {
      query: { market: supportsMarket ? market : undefined, limit, offset },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
