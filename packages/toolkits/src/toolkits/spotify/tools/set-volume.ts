// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifySetVolume = tool({
  description:
    'Sets the playback volume on a device, 0-100 percent. Requires the user-modify-playback-state scope.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    volumePercent: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe('Volume level from 0 (silent) to 100 (max)'),
    deviceId: z
      .string()
      .optional()
      .describe('Target device id from spotifyGetDevices (default: the active device)'),
  }),
  execute: async ({ spotifyToken, volumePercent, deviceId }) => {
    if (volumePercent === undefined || volumePercent === null)
      return { error: 'volumePercent is required (0-100).' };

    const result = await spotifyRequest(spotifyToken, '/me/player/volume', {
      method: 'PUT',
      query: { volume_percent: volumePercent, device_id: deviceId },
    });
    if (result.error) return result;

    return { ok: true, status: result.status, data: result.data ?? null };
  },
});
