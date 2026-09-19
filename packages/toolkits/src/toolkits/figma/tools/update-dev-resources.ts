// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const updateDevResources = tool({
    description:
        'Updates the name and/or URL of dev resources by ID. Omitted fields are retained.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('Main file key containing the resources'),
        devResources: z.array(z.object({
            id: z.string().describe('Dev resource ID to update'),
            name: z.string().optional().describe('New name'),
            url: z.string().optional().describe('New URL'),
        })).min(1),
    }),
    execute: async ({ figmaToken, fileKey, devResources }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/dev_resources`, {
                method: 'PUT',
                body: { dev_resources: devResources },
            });
            if (!result.ok) return { error: 'Failed to update dev resources', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error updating dev resources',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
