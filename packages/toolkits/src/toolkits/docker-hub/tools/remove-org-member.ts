// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const removeOrgMember = tool({
    description: 'Remove a member from a Docker Hub organization.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        org_name: z.string().describe('Organization slug/name'),
        username: z.string().describe('Docker Hub username to remove'),
    }),

    execute: async ({ dockerHubCredentials, org_name, username }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/orgs/${encodeURIComponent(org_name)}/members/${encodeURIComponent(username)}`,
                { method: 'DELETE' },
            );

            if (result.ok || result.status === 404) {
                return { message: 'Member successfully removed from organization' };
            }

            return { error: 'Failed to remove organization member', details: result.data, statusCode: result.status };
        } catch (error) {
            return { error: 'Error removing organization member', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
