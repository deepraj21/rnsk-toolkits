// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyToggleShuffle = tool({
  description:
    'Turns shuffle on or off for the playback context. Requires the user-modify-playback-state scope (Spotify Premium).',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    state: z.boolean().describe('true = shuffle on, false = shuffle off'),
    deviceId: z
      .string()
      .optional()
      .describe('Target device id from spotifyGetDevices (default: the active device)'),
  }),
  execute: async ({ spotifyToken, state, deviceId }) => {
    if (state === undefined || state === null) return { error: 'state is required (true/false).' };

    const result = await spotifyRequest(spotifyToken, '/me/player/shuffle', {
      method: 'PUT',
      query: { state, device_id: deviceId },
    });
    if (result.error) return result;

    return { ok: true, status: result.status, data: result.data ?? null };
  },
});
