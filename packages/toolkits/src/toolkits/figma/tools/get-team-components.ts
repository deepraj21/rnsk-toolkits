// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getTeamComponents = tool({
    description:
        'Lists published components in a team library with pagination. Find team_id in the team page URL (.../team/TEAM_ID/...).',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        teamId: z.string().describe('Team ID from the team page URL'),
        pageSize: z.number().optional().describe('Components per page (max 1000, default 30)'),
        after: z.number().optional().describe('Cursor for next page (exclusive with before)'),
        before: z.number().optional().describe('Cursor for previous page (exclusive with after)'),
    }),
    execute: async ({ figmaToken, teamId, pageSize, after, before }) => {
        try {
            if (after !== undefined && before !== undefined) return { error: 'after and before are mutually exclusive' };
            const result = await figmaRequest(figmaToken, `/v1/teams/${teamId}/components`, {
                query: { page_size: pageSize, after, before },
            });
            if (!result.ok) return { error: 'Failed to get team components', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting team components',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
