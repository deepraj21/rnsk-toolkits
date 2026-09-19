// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getLocalVariables = tool({
    description:
        'Gets all local/remote variables with mode-specific values. Use for full semantic coverage where published variables omit values.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key'),
    }),
    execute: async ({ figmaToken, fileKey }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/variables/local`);
            if (!result.ok) return { error: 'Failed to get local variables', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting local variables',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
