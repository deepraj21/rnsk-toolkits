// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const updateComment = tool({
    description:
        'Edits the text of an existing comment. Use to update or correct a previously posted comment.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Comment ID to update'),
        textOriginal: z.string().min(1).describe('New comment text (replaces existing text)'),
    }),
    execute: async ({ youtubeToken, id, textOriginal }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/comments', {
                method: 'PUT',
                query: { part: 'snippet' },
                body: { id, snippet: { textOriginal } },
            });
            if (!result.ok) return { error: 'Failed to update comment', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error updating comment',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
