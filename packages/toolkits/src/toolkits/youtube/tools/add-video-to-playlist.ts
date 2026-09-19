// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const addVideoToPlaylist = tool({
    description:
        'Adds a video to a playlist by inserting a playlist item. Use when organizing videos into playlists or building curated collections.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        playlistId: z.string().describe('Playlist ID to add the video to (use listUserPlaylists to discover IDs)'),
        videoId: z.string().describe('YouTube video ID to add (typically 11 characters)'),
        position: z.number().min(0).optional().describe('Zero-based insert position; omit to append to the end'),
    }),
    execute: async ({ youtubeToken, playlistId, videoId, position }) => {
        try {
            const snippet: Record<string, unknown> = {
                playlistId,
                resourceId: { kind: 'youtube#video', videoId },
            };
            if (position !== undefined) snippet.position = position;
            const result = await youtubeRequest(youtubeToken, '/playlistItems', {
                method: 'POST',
                query: { part: 'snippet,contentDetails,status' },
                body: { snippet },
            });
            if (!result.ok) return { error: 'Failed to add video to playlist', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error adding video to playlist',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
