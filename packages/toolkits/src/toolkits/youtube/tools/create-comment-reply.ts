// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const createCommentReply = tool({
    description:
        'Replies to an existing comment. Use when responding to users or engaging in video conversations.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        parentId: z.string().describe('ID of the parent comment to reply to'),
        textOriginal: z.string().min(1).describe('Reply text (cannot be empty)'),
    }),
    execute: async ({ youtubeToken, parentId, textOriginal }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/comments', {
                method: 'POST',
                query: { part: 'snippet' },
                body: { snippet: { parentId, textOriginal } },
            });
            if (!result.ok) return { error: 'Failed to create comment reply', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error creating comment reply',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
