// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId, compact } from './client.js';

export const spotifyUpdatePlaylistDetails = tool({
  description:
    "Changes a playlist's name, description, visibility, and/or collaborative flag. Only the fields you pass are updated. Requires the playlist-modify-public scope (and playlist-modify-private for private playlists).",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Playlist ID, spotify:playlist: URI, or open.spotify.com playlist URL'),
    name: z.string().optional().describe('New playlist name'),
    description: z.string().optional().describe('New playlist description'),
    public: z
      .boolean()
      .optional()
      .describe('New visibility: true = public, false = private'),
    collaborative: z
      .boolean()
      .optional()
      .describe('New collaborative flag: true = others can edit'),
  }),
  execute: async ({ spotifyToken, id, name, description, public: isPublic, collaborative }) => {
    const playlistId = spotifyId(id);
    if (!playlistId) return { error: 'id is required.' };

    const body = compact({ name, description, public: isPublic, collaborative });
    if (Object.keys(body).length === 0)
      return { error: 'Provide at least one of name, description, public, or collaborative.' };

    const result = await spotifyRequest(spotifyToken, `/playlists/${playlistId}`, {
      method: 'PUT',
      body,
    });
    if (result.error) return result;

    return { updated: true, status: result.status, data: result.data ?? null };
  },
});
