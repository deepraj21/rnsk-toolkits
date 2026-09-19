// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const addReactionToAComment = tool({
    description:
        'Posts an emoji reaction (shortcode like :heart:) to a comment in a file or branch.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
        commentId: z.string().describe('Comment ID to react to'),
        emoji: z.string().describe('Emoji shortcode, e.g. :heart: or :+1::skin-tone-2:'),
    }),
    execute: async ({ figmaToken, fileKey, commentId, emoji }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/comments/${commentId}/reactions`, {
                method: 'POST',
                body: { emoji },
            });
            if (!result.ok) return { error: 'Failed to add reaction', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error adding reaction',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
