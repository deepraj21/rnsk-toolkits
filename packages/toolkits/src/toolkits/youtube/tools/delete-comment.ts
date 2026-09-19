// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const deleteComment = tool({
    description:
        'Deletes a comment owned by the authenticated user or channel.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Comment ID to delete (must be owned by the authenticated channel)'),
    }),
    execute: async ({ youtubeToken, id }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/comments', {
                method: 'DELETE',
                query: { id },
            });
            if (!result.ok) return { error: 'Failed to delete comment', details: result.error };
            return { commentId: id, deleted: true, httpStatus: 204 };
        } catch (error) {
            return {
                error: 'Error deleting comment',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
