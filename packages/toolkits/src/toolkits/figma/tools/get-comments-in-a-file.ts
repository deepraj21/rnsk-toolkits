// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getCommentsInAFile = tool({
    description:
        'Retrieves all comments (content, author, position, reactions) from a file or branch. Set asMd for Markdown content.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
        asMd: z.boolean().optional().describe('Return content as Markdown (default rich text)'),
    }),
    execute: async ({ figmaToken, fileKey, asMd }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/comments`, {
                query: { as_md: asMd },
            });
            if (!result.ok) return { error: 'Failed to get comments', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting comments',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
