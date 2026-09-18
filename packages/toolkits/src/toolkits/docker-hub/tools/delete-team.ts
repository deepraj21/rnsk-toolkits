// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const deleteTeam = tool({
    description: 'Permanently delete a team (group) from a Docker Hub organization.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        org_name: z.string().describe('Organization slug/name'),
        team_name: z.string().describe('Team slug/name to delete'),
    }),

    execute: async ({ dockerHubCredentials, org_name, team_name }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/orgs/${encodeURIComponent(org_name)}/groups/${encodeURIComponent(team_name)}`,
                { method: 'DELETE' },
            );

            if (result.ok || result.status === 404) {
                return { success: true, message: 'Team deleted successfully' };
            }

            return { error: 'Failed to delete team', details: result.data, statusCode: result.status };
        } catch (error) {
            return { error: 'Error deleting team', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
