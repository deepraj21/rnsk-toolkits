// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, compact } from './client.js';

export const spotifyCreatePlaylist = tool({
  description:
    'Creates a new playlist in the current user\'s profile (empty — add items with spotifyAddPlaylistItems afterwards). Requires the playlist-modify-public scope (and playlist-modify-private for private playlists).',
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    name: z.string().min(1).describe('Playlist name, e.g. "Road Trip 2026"'),
    description: z.string().optional().describe('Playlist description'),
    public: z
      .boolean()
      .optional()
      .describe('true = public on the user profile, false = private (default true)'),
    collaborative: z
      .boolean()
      .optional()
      .describe('true = collaborative playlist others can edit (implies it is not public)'),
  }),
  execute: async ({ spotifyToken, name, description, public: isPublic, collaborative }) => {
    if (!name) return { error: 'name is required.' };

    const result = await spotifyRequest(spotifyToken, '/me/playlists', {
      method: 'POST',
      body: compact({ name, description, public: isPublic, collaborative }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
