// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId, spotifyUri, compact } from './client.js';

export const spotifyReplacePlaylistItems = tool({
  description:
    "Two mutually exclusive operations on one endpoint: pass `uris` to REPLACE the playlist's entire contents (or clear it with an empty list — but this tool requires at least one item, so use uris only when you intend a full overwrite), or pass rangeStart/insertBefore (+ optional rangeLength and snapshotId) to REORDER existing items. Providing both is an error. Requires the playlist-modify-public scope.",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Playlist ID, spotify:playlist: URI, or open.spotify.com playlist URL'),
    uris: z
      .array(z.string().min(1))
      .optional()
      .describe(
        'Replace mode: the full new list of track/episode URIs (overwrites everything, max 100)',
      ),
    rangeStart: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Reorder mode: zero-based index of the first item to move'),
    insertBefore: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Reorder mode: zero-based index to insert the moved items before'),
    rangeLength: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Reorder mode: how many items to move from rangeStart (default 1)'),
    snapshotId: z
      .string()
      .optional()
      .describe('Reorder mode: playlist snapshot ID to validate the change against'),
  }),
  execute: async ({ spotifyToken, id, uris, rangeStart, insertBefore, rangeLength, snapshotId }) => {
    const playlistId = spotifyId(id);
    if (!playlistId) return { error: 'id is required.' };

    const reorderMode = rangeStart !== undefined || insertBefore !== undefined;
    if (uris && reorderMode)
      return { error: 'Pass either uris (replace) or rangeStart/insertBefore (reorder), not both.' };
    if (!uris && !reorderMode)
      return {
        error:
          'Provide uris to replace the playlist items, or rangeStart + insertBefore to reorder them.',
      };
    if (reorderMode && (rangeStart === undefined || insertBefore === undefined))
      return { error: 'Both rangeStart and insertBefore are required for reordering.' };

    const body = uris
      ? { uris: uris.map((u) => spotifyUri(u, 'track')) }
      : compact({ range_start: rangeStart, insert_before: insertBefore, range_length: rangeLength, snapshot_id: snapshotId });

    const result = await spotifyRequest(spotifyToken, `/playlists/${playlistId}/items`, {
      method: 'PUT',
      body,
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
