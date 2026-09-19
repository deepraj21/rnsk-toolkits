// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { onBehalfOfContentOwnerField, youtubeRequest, youtubeTokenField } from './client.js';

export const deletePlaylist = tool({
    description:
        'Permanently deletes a playlist owned by the authenticated user/channel. Requires explicit confirmDelete=true to prevent accidents.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Playlist ID to delete (must be owned by the authenticated user)'),
        confirmDelete: z.boolean().describe('Must be true to execute the deletion'),
        onBehalfOfContentOwner: onBehalfOfContentOwnerField,
    }),
    execute: async ({ youtubeToken, id, confirmDelete, onBehalfOfContentOwner }) => {
        try {
            if (confirmDelete !== true) return { error: 'Deletion requires confirmDelete: true' };
            const result = await youtubeRequest(youtubeToken, '/playlists', {
                method: 'DELETE',
                query: { id, onBehalfOfContentOwner },
            });
            if (!result.ok) return { error: 'Failed to delete playlist', details: result.error };
            return { playlistId: id, deleted: true, httpStatus: 204 };
        } catch (error) {
            return {
                error: 'Error deleting playlist',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
