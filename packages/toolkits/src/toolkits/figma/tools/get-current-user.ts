// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getCurrentUser = tool({
    description:
        'Returns the authenticated user (id, handle, avatar, email). No parameters needed.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
    }),
    execute: async ({ figmaToken }) => {
        try {
            const result = await figmaRequest(figmaToken, '/v1/me');
            if (!result.ok) return { error: 'Failed to get current user', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting current user',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
