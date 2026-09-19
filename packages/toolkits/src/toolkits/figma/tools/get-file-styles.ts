// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getFileStyles = tool({
    description:
        'Lists published styles (fills, text, effects, grids) from a main library file. For local/unpublished styles use getFileJson instead.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('Main file key from the file URL'),
    }),
    execute: async ({ figmaToken, fileKey }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/styles`);
            if (!result.ok) return { error: 'Failed to get file styles', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting file styles',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
