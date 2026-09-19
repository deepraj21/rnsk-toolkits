// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getPublishedVariables = tool({
    description:
        'Gets published variables from a main library file (Enterprise members only). Omits mode-specific values — use getLocalVariables for those.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('Main file key (branches not supported)'),
    }),
    execute: async ({ figmaToken, fileKey }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/variables/published`);
            if (!result.ok) return { error: 'Failed to get published variables', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting published variables',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
