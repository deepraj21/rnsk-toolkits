// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifySearch = tool({
  description:
    "Searches Spotify's catalog for tracks, albums, artists, playlists, shows, episodes, and audiobooks. Returns up to 10 results per requested type, each as a paging object (total/limit/offset) — increase offset to page. Use this to find IDs/URIs for other Spotify tools.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    q: z
      .string()
      .min(1)
      .describe('Search query, e.g. "artist:Daft Punk", "album:Discovery", or plain keywords'),
    type: z
      .array(z.enum(['album', 'artist', 'playlist', 'track', 'show', 'episode', 'audiobook']))
      .optional()
      .describe('Item types to search for (default ["track"]); several types can be combined'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code to filter results available in that market'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe('Max results per item type, 1-10 (default 5)'),
    offset: z.number().int().min(0).max(1000).optional().describe('Pagination offset (default 0)'),
    includeExternal: z
      .enum(['audio'])
      .optional()
      .describe('Only return results that have an external audio file (include_external=audio)'),
  }),
  execute: async ({ spotifyToken, q, type, market, limit, offset, includeExternal }) => {
    if (q === undefined || q === null || String(q).trim() === '')
      return { error: 'q is required.' };

    const result = await spotifyRequest(spotifyToken, '/search', {
      query: {
        q,
        type: (type && type.length ? type : ['track']).join(','),
        market,
        limit,
        offset,
        include_external: includeExternal,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
