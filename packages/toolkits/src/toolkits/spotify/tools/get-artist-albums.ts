// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetArtistAlbums = tool({
  description:
    "Gets a page of an artist's albums (simplified album objects) as a paging object. Filter by release group (album/single/appears_on/compilation) and country; page with limit/offset. Note: artist albums are limited to 10 per request.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Artist ID, spotify:artist: URI, or open.spotify.com artist URL'),
    includeGroups: z
      .array(z.enum(['album', 'single', 'appears_on', 'compilation']))
      .optional()
      .describe('Release groups to include (default all)'),
    country: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — only albums available in that market'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe('Max albums per page, 1-10 (default 5)'),
    offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
  }),
  execute: async ({ spotifyToken, id, includeGroups, country, limit, offset }) => {
    const artistId = spotifyId(id);
    if (!artistId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/artists/${artistId}/albums`, {
      query: {
        include_groups: includeGroups && includeGroups.length ? includeGroups.join(',') : undefined,
        country,
        limit,
        offset,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
