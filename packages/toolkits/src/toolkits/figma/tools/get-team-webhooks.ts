// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getTeamWebhooks = tool({
    description:
        'Lists webhooks for a team, project, or file context (V2 API). Extract context IDs from Figma URLs or discoverFigmaResources.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        contextId: z.string().describe('Team, project, or file ID to query'),
        context: z.enum(['team', 'project', 'file']).optional().describe('Context type (default team)'),
    }),
    execute: async ({ figmaToken, contextId, context }) => {
        try {
            const result = await figmaRequest(figmaToken, '/v2/webhooks', {
                query: { context: context ?? 'team', context_id: contextId },
            });
            if (!result.ok) return { error: 'Failed to get webhooks', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting webhooks',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
