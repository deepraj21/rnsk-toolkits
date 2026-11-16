// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetDevices = tool({
  description:
    "Lists the user's Spotify playback devices (computers, phones, speakers, web player) with their active/volume state. Use a device's id as `deviceId` in the playback control tools. Requires the user-read-playback-state scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
  }),
  execute: async ({ spotifyToken }) => {
    const result = await spotifyRequest(spotifyToken, '/me/player/devices');
    if (result.error) return result;

    return result.data ?? {};
  },
});
