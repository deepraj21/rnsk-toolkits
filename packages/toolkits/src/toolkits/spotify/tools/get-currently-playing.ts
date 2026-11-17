// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetCurrentlyPlaying = tool({
  description:
    'Gets what the user is playing right now (track or episode object plus progress) — or an empty object when playback is stopped/paused with nothing loaded. Requires the user-read-currently-playing scope.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts the item to that market'),
    additionalTypes: z
      .array(z.enum(['track', 'episode']))
      .optional()
      .describe('Additional item types the client supports besides the default track type'),
  }),
  execute: async ({ spotifyToken, market, additionalTypes }) => {
    const result = await spotifyRequest(spotifyToken, '/me/player/currently-playing', {
      query: {
        market,
        additional_types:
          additionalTypes && additionalTypes.length ? additionalTypes.join(',') : undefined,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
