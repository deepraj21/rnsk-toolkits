// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const markCommentAsSpam = tool({
    description:
        'Flags comments as spam for moderation. Note: the underlying comments.markAsSpam endpoint is deprecated but still functional.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Comma-separated comment IDs to mark as spam'),
    }),
    execute: async ({ youtubeToken, id }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/comments/markAsSpam', {
                method: 'POST',
                query: { id },
            });
            if (!result.ok) return { error: 'Failed to mark comments as spam', details: result.error };
            return { success: true, httpStatus: 204, commentIds: id };
        } catch (error) {
            return {
                error: 'Error marking comments as spam',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
