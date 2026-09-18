// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const removeTeamMember = tool({
    description: 'Remove a user from a Docker Hub organization team (group).',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        org_name: z.string().describe('Organization slug/name'),
        team_slug: z.string().describe('Team slug/name'),
        username: z.string().describe('Docker Hub username to remove from the team'),
    }),

    execute: async ({ dockerHubCredentials, org_name, team_slug, username }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/orgs/${encodeURIComponent(org_name)}/groups/${encodeURIComponent(team_slug)}/members/${encodeURIComponent(username)}`,
                { method: 'DELETE' },
            );

            if (result.ok || result.status === 404) {
                return { success: true, message: 'Member removed from team successfully' };
            }

            return { error: 'Failed to remove team member', details: result.data, statusCode: result.status };
        } catch (error) {
            return { error: 'Error removing team member', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
