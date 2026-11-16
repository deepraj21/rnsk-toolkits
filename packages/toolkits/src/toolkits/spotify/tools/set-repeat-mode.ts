// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifySetRepeatMode = tool({
  description:
    'Sets the repeat mode for the playback context: repeat one track, repeat the whole context, or off. Requires the user-modify-playback-state scope.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    state: z
      .enum(['track', 'context', 'off'])
      .describe('"track" = repeat current track, "context" = repeat context, "off" = no repeat'),
    deviceId: z
      .string()
      .optional()
      .describe('Target device id from spotifyGetDevices (default: the active device)'),
  }),
  execute: async ({ spotifyToken, state, deviceId }) => {
    if (!state) return { error: 'state is required (track, context, or off).' };

    const result = await spotifyRequest(spotifyToken, '/me/player/repeat', {
      method: 'PUT',
      query: { state, device_id: deviceId },
    });
    if (result.error) return result;

    return { ok: true, status: result.status, data: result.data ?? null };
  },
});
