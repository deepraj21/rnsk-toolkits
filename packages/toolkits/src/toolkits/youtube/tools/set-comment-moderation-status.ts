// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const setCommentModerationStatus = tool({
    description:
        'Holds, publishes, or rejects comments for moderation. Optionally bans the author when rejecting.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Comma-separated comment IDs (not thread IDs)'),
        moderationStatus: z.enum(['heldForReview', 'published', 'rejected']).describe('New moderation status'),
        banAuthor: z.boolean().optional().describe('Ban the author (only valid with rejected, default false)'),
    }),
    execute: async ({ youtubeToken, id, moderationStatus, banAuthor }) => {
        try {
            if (banAuthor === true && moderationStatus !== 'rejected') {
                return { error: 'banAuthor is only valid when moderationStatus is rejected' };
            }
            const result = await youtubeRequest(youtubeToken, '/comments/setModerationStatus', {
                method: 'POST',
                query: { id, moderationStatus, banAuthor },
            });
            if (!result.ok) return { error: 'Failed to set moderation status', details: result.error };
            return { success: true, message: 'Comment moderation status updated successfully' };
        } catch (error) {
            return {
                error: 'Error setting moderation status',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
