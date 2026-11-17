// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyUri, compact } from './client.js';

export const spotifyStartPlayback = tool({
  description:
    'Starts/resumes playback on a device. Pass `contextUri` to play an album/artist/playlist, `uris` to play specific tracks, or neither to resume what was paused. Optional `offset` picks the starting item inside a context, `positionMs` seeks into it. Requires the user-modify-playback-state scope (Spotify Premium for most devices).',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    deviceId: z
      .string()
      .optional()
      .describe('Target device id from spotifyGetDevices (default: the active device)'),
    contextUri: z
      .string()
      .optional()
      .describe('Context to play: spotify:album:…, spotify:artist:…, or spotify:playlist:…'),
    uris: z
      .array(z.string().min(1))
      .optional()
      .describe('Specific items to play (spotify:track:…) — alternative to contextUri'),
    offset: z
      .object({
        position: z.number().int().min(0).optional().describe('Zero-based index into the context'),
        uri: z.string().optional().describe('URI of the item to start from (inside the context)'),
      })
      .optional()
      .describe('Where inside the context to start playing'),
    positionMs: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Position in milliseconds to seek to before playing'),
  }),
  execute: async ({ spotifyToken, deviceId, contextUri, uris, offset, positionMs }) => {
    if (contextUri && uris) return { error: 'Pass either contextUri or uris, not both.' };
    if (!contextUri && !uris && positionMs === undefined && !offset)
      return {
        error:
          'Provide contextUri or uris to start something specific, or positionMs to resume — otherwise use spotifyPausePlayback-style control with no body.',
      };

    const body = compact({
      context_uri: contextUri,
      uris: uris ? uris.map((u) => spotifyUri(u, 'track')) : undefined,
      offset,
      position_ms: positionMs,
    });

    const result = await spotifyRequest(spotifyToken, '/me/player/play', {
      method: 'PUT',
      query: { device_id: deviceId },
      body: Object.keys(body).length ? body : {},
    });
    if (result.error) return result;

    return { ok: true, status: result.status, data: result.data ?? null };
  },
});
