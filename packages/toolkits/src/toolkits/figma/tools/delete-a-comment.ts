// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const deleteAComment = tool({
    description:
        'Deletes a comment from a file or branch. Only the original author can delete it.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
        commentId: z.string().describe('Comment ID (from listing or creation response)'),
    }),
    execute: async ({ figmaToken, fileKey, commentId }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/comments/${commentId}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete comment', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error deleting comment',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
