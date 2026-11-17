// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifySeekToPosition = tool({
  description:
    'Seeks to a position (in milliseconds) within the currently playing track. Seeking past the end advances to the next track. Requires the user-modify-playback-state scope.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    positionMs: z
      .number()
      .int()
      .min(0)
      .describe('Milliseconds from the start of the track to seek to'),
    deviceId: z
      .string()
      .optional()
      .describe('Target device id from spotifyGetDevices (default: the active device)'),
  }),
  execute: async ({ spotifyToken, positionMs, deviceId }) => {
    if (positionMs === undefined || positionMs === null)
      return { error: 'positionMs is required.' };

    const result = await spotifyRequest(spotifyToken, '/me/player/seek', {
      method: 'PUT',
      query: { position_ms: positionMs, device_id: deviceId },
    });
    if (result.error) return result;

    return { ok: true, status: result.status, data: result.data ?? null };
  },
});
