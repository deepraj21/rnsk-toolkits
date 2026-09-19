// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const deletePlaylistItem = tool({
    description:
        'Removes a video from a playlist by deleting the playlist item. Use the playlist item ID (not the video ID).',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Playlist item ID to delete (identifies a specific video within a playlist)'),
    }),
    execute: async ({ youtubeToken, id }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/playlistItems', {
                method: 'DELETE',
                query: { id },
            });
            if (!result.ok) return { error: 'Failed to delete playlist item', details: result.error };
            return { playlistItemId: id, deleted: true, httpStatus: 204 };
        } catch (error) {
            return {
                error: 'Error deleting playlist item',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
