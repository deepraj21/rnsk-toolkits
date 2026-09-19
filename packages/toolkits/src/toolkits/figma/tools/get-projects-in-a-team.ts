// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getProjectsInATeam = tool({
    description:
        'Lists projects in a team visible to you. Find team_id in the team page URL (.../team/TEAM_ID/...).',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        teamId: z.string().describe('Team ID from the team page URL'),
    }),
    execute: async ({ figmaToken, teamId }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/teams/${teamId}/projects`);
            if (!result.ok) return { error: 'Failed to get team projects', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting team projects',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
