// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyUri } from './client.js';

export const spotifyCheckLibraryItems = tool({
  description:
    "Checks which of the given items are already in the user's saved library — returns a boolean array aligned to the input order (true = saved). Max 40 URIs per call. Accepts full URIs, open.spotify.com URLs, or bare IDs (pass `type` to convert bare IDs). Requires the user-library-read scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    uris: z
      .array(z.string().min(1))
      .min(1)
      .max(40)
      .describe('Up to 40 item URIs/URLs/IDs to check (spotify:track:…, album, show, episode, audiobook)'),
    type: z
      .enum(['track', 'album', 'show', 'episode', 'audiobook'])
      .optional()
      .describe('Item type used to convert bare IDs into spotify:<type>:<id> URIs'),
  }),
  execute: async ({ spotifyToken, uris, type }) => {
    if (!uris || !uris.length) return { error: 'uris is required (at least one item).' };

    const normalized = uris.map((u) => spotifyUri(u, type));
    const result = await spotifyRequest(spotifyToken, '/me/library/contains', {
      query: { uris: normalized.join(',') },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
