// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getComponent2 = tool({
    description:
        'Fetches published component metadata by component key. Use for team library components.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        key: z.string().describe('Unique component key'),
    }),
    execute: async ({ figmaToken, key }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/components/${key}`);
            if (!result.ok) return { error: 'Failed to get component', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting component',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
