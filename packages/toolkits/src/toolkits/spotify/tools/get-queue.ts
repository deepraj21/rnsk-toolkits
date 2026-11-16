// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetQueue = tool({
  description:
    "Gets the user's current playback queue: what is playing now plus the upcoming items in order. Requires the user-read-currently-playing or user-read-playback-state scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
  }),
  execute: async ({ spotifyToken }) => {
    const result = await spotifyRequest(spotifyToken, '/me/player/queue');
    if (result.error) return result;

    return result.data ?? {};
  },
});
