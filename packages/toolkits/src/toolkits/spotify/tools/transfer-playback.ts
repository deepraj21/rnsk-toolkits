// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyTransferPlayback = tool({
  description:
    'Transfers playback to one or more other devices (e.g. from the web player to a speaker). Optionally starts playing immediately after the switch. Requires the user-modify-playback-state scope (Spotify Premium).',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    deviceIds: z
      .array(z.string().min(1))
      .min(1)
      .describe('Device id(s) from spotifyGetDevices to transfer playback to, in preference order'),
    play: z
      .boolean()
      .optional()
      .describe(
        'true = start playing on the target device immediately (default: keep current state)',
      ),
  }),
  execute: async ({ spotifyToken, deviceIds, play }) => {
    if (!deviceIds || !deviceIds.length)
      return { error: 'deviceIds is required (at least one device id).' };

    const body = { device_ids: deviceIds };
    if (play !== undefined) body.play = play;

    const result = await spotifyRequest(spotifyToken, '/me/player', {
      method: 'PUT',
      body,
    });
    if (result.error) return result;

    return { ok: true, status: result.status, data: result.data ?? null };
  },
});
