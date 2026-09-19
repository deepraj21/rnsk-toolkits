// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { youtubeRequest, youtubeTokenField } from './client.js';

export const listComments = tool({
    description:
        'Lists individual comments by ID, or all replies to a top-level comment via parentId. Exactly one of id or parentId is typically used.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().optional().describe('Comma-separated comment IDs (mutually exclusive with parentId)'),
        parentId: z.string().optional().describe('Parent comment ID to fetch replies for (mutually exclusive with id)'),
        part: z.string().optional().describe("Resource parts: 'id' and/or 'snippet' (default snippet)"),
        maxResults: z.number().min(1).max(100).optional().describe('Results per page (1-100, default 20; incompatible with id)'),
        pageToken: z.string().optional().describe('Page token from a previous response'),
        textFormat: z.enum(['html', 'plainText']).optional().describe('Text format (default html)'),
    }),
    execute: async ({ youtubeToken, id, parentId, part, maxResults, pageToken, textFormat }) => {
        try {
            if (id && parentId) return { error: 'id and parentId are mutually exclusive' };
            const result = await youtubeRequest(youtubeToken, '/comments', {
                query: { part: part ?? 'snippet', id, parentId, maxResults, pageToken, textFormat },
            });
            if (!result.ok) return { error: 'Failed to list comments', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing comments',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
