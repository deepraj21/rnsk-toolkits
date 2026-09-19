// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getComponentSet = tool({
    description:
        'Fetches published component set metadata by set key.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        key: z.string().describe('Unique component set key'),
    }),
    execute: async ({ figmaToken, key }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/component_sets/${key}`);
            if (!result.ok) return { error: 'Failed to get component set', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting component set',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
