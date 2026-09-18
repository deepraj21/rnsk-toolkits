// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const getTeam = tool({
    description: 'Retrieve details of a specific team (group) within a Docker Hub organization.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        org_name: z.string().describe('Organization slug/name'),
        team_name: z.string().describe('Team slug/name'),
    }),

    execute: async ({ dockerHubCredentials, org_name, team_name }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/orgs/${encodeURIComponent(org_name)}/groups/${encodeURIComponent(team_name)}`,
            );

            if (!result.ok) {
                return { error: 'Failed to get team', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error getting team', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
