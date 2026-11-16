// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest } from './client.js';

export const spotifyGetCurrentUser = tool({
  description:
    "Gets the full profile of the user behind the connected Spotify account — display name, country, product (free/premium), followers, and (with the right scopes) email. Use this to confirm whose account is connected. Requires user-read-private; email requires user-read-email.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
  }),
  execute: async ({ spotifyToken }) => {
    const result = await spotifyRequest(spotifyToken, '/me');
    if (result.error) return result;

    return result.data ?? {};
  },
});
