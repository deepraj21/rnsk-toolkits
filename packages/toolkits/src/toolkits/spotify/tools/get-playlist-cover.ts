// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyGetPlaylistCover = tool({
  description:
    'Gets the cover images currently set on a playlist (size variants, largest first). Returns an empty array if the playlist has no custom cover. Accepts a bare playlist ID, URI, or URL.',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Playlist ID, spotify:playlist: URI, or open.spotify.com playlist URL'),
  }),
  execute: async ({ spotifyToken, id }) => {
    const playlistId = spotifyId(id);
    if (!playlistId) return { error: 'id is required.' };

    const result = await spotifyRequest(spotifyToken, `/playlists/${playlistId}/images`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
