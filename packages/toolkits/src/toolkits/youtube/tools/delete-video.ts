// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { onBehalfOfContentOwnerField, youtubeRequest, youtubeTokenField } from './client.js';

export const deleteVideo = tool({
    description:
        'Permanently deletes a video owned by the authenticated channel. Requires explicit confirmDelete=true.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        videoId: z.string().describe('Video ID to delete (must be owned by the authenticated channel)'),
        confirmDelete: z.boolean().describe('Must be true to execute the deletion'),
        onBehalfOfContentOwner: onBehalfOfContentOwnerField,
    }),
    execute: async ({ youtubeToken, videoId, confirmDelete, onBehalfOfContentOwner }) => {
        try {
            if (confirmDelete !== true) return { error: 'Deletion requires confirmDelete: true' };
            const result = await youtubeRequest(youtubeToken, '/videos', {
                method: 'DELETE',
                query: { id: videoId, onBehalfOfContentOwner },
            });
            if (!result.ok) return { error: 'Failed to delete video', details: result.error };
            return { videoId, deleted: true, httpStatus: 204 };
        } catch (error) {
            return {
                error: 'Error deleting video',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
