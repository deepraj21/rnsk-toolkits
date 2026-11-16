// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifySkipToNext = tool({
  description:
    'Skips playback to the next track in the queue. Requires the user-modify-playback-state scope.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    deviceId: z
      .string()
      .optional()
      .describe('Target device id from spotifyGetDevices (default: the active device)'),
  }),
  execute: async ({ spotifyToken, deviceId }) => {
    const result = await spotifyRequest(spotifyToken, '/me/player/next', {
      method: 'POST',
      query: { device_id: deviceId },
    });
    if (result.error) return result;

    return { ok: true, status: result.status, data: result.data ?? null };
  },
});
