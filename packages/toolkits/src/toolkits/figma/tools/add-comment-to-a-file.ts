// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const addCommentToAFile = tool({
    description:
        'Posts a comment to a file or branch, optionally as a reply to a root comment (no nested replies). Provide clientMeta to position the pin.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
        message: z.string().describe('Comment text'),
        commentId: z.string().optional().describe('Root comment ID to reply to'),
        clientMeta: z.record(z.any()).optional().describe('Position: {x,y}, {node_id,node_offset}, or region with positive region_height/region_width'),
    }),
    execute: async ({ figmaToken, fileKey, message, commentId, clientMeta }) => {
        try {
            if (clientMeta && ('region_height' in clientMeta || 'region_width' in clientMeta)) {
                const h = Number(clientMeta.region_height);
                const w = Number(clientMeta.region_width);
                if (!(h > 0) || !(w > 0)) return { error: 'region_height and region_width must be positive' };
            }
            const body: Record<string, unknown> = { message };
            if (commentId) body.comment_id = commentId;
            if (clientMeta) body.client_meta = clientMeta;
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/comments`, {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to post comment', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error posting comment',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
