// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const deleteDevResource = tool({
    description:
        'Deletes a dev resource from a main file (not a branch).',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('Main file key'),
        devResourceId: z.string().describe('Dev resource ID to delete'),
    }),
    execute: async ({ figmaToken, fileKey, devResourceId }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/dev_resources/${devResourceId}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete dev resource', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error deleting dev resource',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
