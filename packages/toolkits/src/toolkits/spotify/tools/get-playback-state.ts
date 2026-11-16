// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetPlaybackState = tool({
  description:
    "Gets the user's current playback state — device, progress through the track, shuffle/repeat/volume flags, and the currently playing context. Returns an empty object when nothing is playing. Requires the user-read-playback-state scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    market: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 country code — restricts the playing context to that market'),
    additionalTypes: z
      .array(z.enum(['track', 'episode']))
      .optional()
      .describe('Additional item types the client supports besides the default track type'),
  }),
  execute: async ({ spotifyToken, market, additionalTypes }) => {
    const result = await spotifyRequest(spotifyToken, '/me/player', {
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
