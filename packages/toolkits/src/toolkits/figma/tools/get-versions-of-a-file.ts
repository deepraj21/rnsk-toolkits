// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getVersionsOfAFile = tool({
    description:
        'Retrieves version history for a file or branch. Use before/after cursors and pageSize for pagination.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
        pageSize: z.number().optional().describe('Versions per page (default 30)'),
        before: z.number().optional().describe('Return versions created strictly before this version ID'),
        after: z.number().optional().describe('Return versions created strictly after this version ID'),
    }),
    execute: async ({ figmaToken, fileKey, pageSize, before, after }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/versions`, {
                query: { page_size: pageSize, before, after },
            });
            if (!result.ok) return { error: 'Failed to get file versions', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting file versions',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
