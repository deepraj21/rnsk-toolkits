// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const deleteAReaction = tool({
    description:
        'Removes your emoji reaction from a comment. You must have created the reaction; the emoji must match exactly.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
        commentId: z.string().describe('Comment ID to remove the reaction from'),
        emoji: z.string().describe('Exact emoji character of your existing reaction, e.g. ❤️'),
    }),
    execute: async ({ figmaToken, fileKey, commentId, emoji }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/comments/${commentId}/reactions`, {
                method: 'DELETE',
                query: { emoji },
            });
            if (!result.ok) return { error: 'Failed to delete reaction', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error deleting reaction',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
