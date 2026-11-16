// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId, spotifyUri, compact } from './client.js';

export const spotifyRemovePlaylistItems = tool({
  description:
    "Removes specific track/episode occurrences from a playlist (max 100 per call), optionally validated against a snapshot ID so concurrent edits can't remove the wrong items. Requires the playlist-modify-public scope.",
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
      .describe('Up to 100 track/episode URIs, URLs, or bare IDs to remove'),
    snapshotId: z
      .string()
      .optional()
      .describe('Playlist snapshot ID to validate the removal against (recommended)'),
  }),
  execute: async ({ spotifyToken, id, uris, snapshotId }) => {
    const playlistId = spotifyId(id);
    if (!playlistId) return { error: 'id is required.' };
    if (!uris || !uris.length) return { error: 'uris is required (at least one item).' };

    const items = uris.map((u) => ({ uri: spotifyUri(u, 'track') }));
    const result = await spotifyRequest(spotifyToken, `/playlists/${playlistId}/items`, {
      method: 'DELETE',
      body: compact({ items, snapshot_id: snapshotId }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
