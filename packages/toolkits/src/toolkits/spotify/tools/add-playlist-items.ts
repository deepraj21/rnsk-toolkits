// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId, spotifyUri } from './client.js';

export const spotifyAddPlaylistItems = tool({
  description:
    'Adds tracks/episodes to a playlist (appended by default, or inserted at `position`). Max 100 items per call — batch larger sets across calls. Accepts full URIs, open.spotify.com URLs, or bare IDs (treated as tracks unless you pass full URIs). Requires the playlist-modify-public scope.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Playlist ID, spotify:playlist: URI, or open.spotify.com playlist URL'),
    uris: z
      .array(z.string().min(1))
      .min(1)
      .max(100)
      .describe('Up to 100 track/episode URIs, URLs, or bare IDs to add, in order'),
    position: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Zero-based index to insert at (default: append to the end)'),
  }),
  execute: async ({ spotifyToken, id, uris, position }) => {
    const playlistId = spotifyId(id);
    if (!playlistId) return { error: 'id is required.' };
    if (!uris || !uris.length) return { error: 'uris is required (at least one item).' };

    const normalized = uris.map((u) => spotifyUri(u, 'track'));
    const result = await spotifyRequest(spotifyToken, `/playlists/${playlistId}/items`, {
      method: 'POST',
      // Sent in the body (not the query) so 100 URIs never hit URL length limits.
      body: position === undefined ? { uris: normalized } : { uris: normalized, position },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
