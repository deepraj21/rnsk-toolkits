// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getReactionsForAComment = tool({
    description:
        'Lists reactions on a comment with pagination. Use the cursor from a previous response for the next page.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
        commentId: z.string().describe('Comment ID to list reactions for'),
        cursor: z.string().optional().describe('Pagination cursor; omit for the first page'),
    }),
    execute: async ({ figmaToken, fileKey, commentId, cursor }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/comments/${commentId}/reactions`, {
                query: { cursor },
            });
            if (!result.ok) return { error: 'Failed to get reactions', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting reactions',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
