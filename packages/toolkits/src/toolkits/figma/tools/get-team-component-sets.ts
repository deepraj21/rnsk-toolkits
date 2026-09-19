// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getTeamComponentSets = tool({
    description:
        'Lists published component sets in a team library with pagination.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        teamId: z.string().describe('Team ID from the team page URL'),
        pageSize: z.number().optional().describe('Sets per page (default 30)'),
        after: z.number().optional().describe('Cursor for next page (exclusive with before)'),
        before: z.number().optional().describe('Cursor for previous page (exclusive with after)'),
    }),
    execute: async ({ figmaToken, teamId, pageSize, after, before }) => {
        try {
            if (after !== undefined && before !== undefined) return { error: 'after and before are mutually exclusive' };
            const result = await figmaRequest(figmaToken, `/v1/teams/${teamId}/component_sets`, {
                query: { page_size: pageSize, after, before },
            });
            if (!result.ok) return { error: 'Failed to get team component sets', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting team component sets',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
