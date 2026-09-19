// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getDevResources = tool({
    description:
        'Lists dev resources (Jira/GitHub links) on a main file, optionally filtered to nodes.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('Main file key (not a branch)'),
        nodeIds: z.string().optional().describe("Comma-separated node IDs, e.g. '1:2,100:54'"),
    }),
    execute: async ({ figmaToken, fileKey, nodeIds }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/dev_resources`, {
                query: { node_ids: nodeIds },
            });
            if (!result.ok) return { error: 'Failed to get dev resources', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting dev resources',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
