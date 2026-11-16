// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyUri } from './client.js';

export const spotifyAddToQueue = tool({
  description:
    "Adds an item to the end of the user's playback queue. Accepts a full URI, an open.spotify.com URL, or a bare ID (treated as a track). Requires the user-modify-playback-state scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    uri: z
      .string()
      .min(1)
      .describe('Item to queue: spotify:track:… / spotify:episode:… URI, URL, or bare ID'),
    deviceId: z
      .string()
      .optional()
      .describe('Target device id from spotifyGetDevices (default: the active device)'),
  }),
  execute: async ({ spotifyToken, uri, deviceId }) => {
    if (!uri) return { error: 'uri is required.' };

    const result = await spotifyRequest(spotifyToken, '/me/player/queue', {
      method: 'POST',
      query: { uri: spotifyUri(uri, 'track'), device_id: deviceId },
    });
    if (result.error) return result;

    return { queued: true, status: result.status, data: result.data ?? null };
  },
});
