// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { spotifyRequest, spotifyId } from './client.js';

export const spotifyUploadPlaylistCover = tool({
  description:
    "Sets a playlist's cover image from base64-encoded JPEG data (max 256 KB base64, recommended 300x300 px, square). Pass the raw base64 string without a data-URI prefix. Requires the ugc-image-upload scope (plus playlist-modify scope for the playlist).",
  inputSchema: z.object({
    spotifyToken: z.string().optional().describe('Spotify access token (injected by system)'),
    id: z
      .string()
      .min(1)
      .describe('Playlist ID, spotify:playlist: URI, or open.spotify.com playlist URL'),
    base64Jpeg: z
      .string()
      .min(1)
      .describe('Base64-encoded JPEG image data (no data: prefix), max 256 KB after encoding'),
  }),
  execute: async ({ spotifyToken, id, base64Jpeg }) => {
    const playlistId = spotifyId(id);
    if (!playlistId) return { error: 'id is required.' };
    if (!base64Jpeg) return { error: 'base64Jpeg is required.' };

    // The API expects the base64 string as the raw request body, not JSON.
    const result = await spotifyRequest(spotifyToken, `/playlists/${playlistId}/images`, {
      method: 'PUT',
      body: base64Jpeg.trim(),
      headers: { 'Content-Type': 'image/jpeg' },
    });
    if (result.error) return result;

    return { uploaded: true, status: result.status, data: result.data ?? null };
  },
});
