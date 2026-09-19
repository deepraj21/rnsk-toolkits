// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getFileComponents = tool({
    description:
        'Lists published components from a main library file (not a branch). Empty list means nothing published.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('Main file key from the file URL'),
    }),
    execute: async ({ figmaToken, fileKey }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/components`);
            if (!result.ok) return { error: 'Failed to get file components', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting file components',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
