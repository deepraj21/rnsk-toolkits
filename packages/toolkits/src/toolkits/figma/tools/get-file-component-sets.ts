// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getFileComponentSets = tool({
    description:
        'Lists published component sets from a main library file (not a branch).',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('Main file key from the file URL'),
    }),
    execute: async ({ figmaToken, fileKey }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/component_sets`);
            if (!result.ok) return { error: 'Failed to get file component sets', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting file component sets',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
