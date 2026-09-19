// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getStyle = tool({
    description:
        'Fetches metadata for a published team-library style by its 40-char hex key (from file/team style listings).',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        key: z.string().describe('Unique style key'),
    }),
    execute: async ({ figmaToken, key }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/styles/${key}`);
            if (!result.ok) return { error: 'Failed to get style', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting style',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
