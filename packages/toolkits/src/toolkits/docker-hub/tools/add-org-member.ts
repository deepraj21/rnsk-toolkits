// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const addOrgMember = tool({
    description: 'Invite a user to join a Docker Hub organization by Docker ID or email.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        org: z.string().describe('Docker Hub organization name'),
        invitee: z.string().describe('Docker ID or email of the user to invite'),
        role: z.enum(['member', 'editor', 'owner']).optional().describe('Role to assign to the invited member'),
        team: z.string().optional().describe('Optional team name within the organization'),
    }),

    execute: async ({ dockerHubCredentials, org, invitee, role, team }) => {
        try {
            const result = await dockerHubRequest(dockerHubCredentials, '/v2/invites/bulk', {
                method: 'POST',
                body: {
                    org,
                    invitees: [invitee],
                    ...(role ? { role } : {}),
                    ...(team ? { team } : {}),
                },
            });

            if (!result.ok) {
                return { error: 'Failed to invite organization member', details: result.data, statusCode: result.status };
            }

            return {
                success: true,
                invitees: result.data?.invitees ?? result.data,
                message: 'Invitation processed',
            };
        } catch (error) {
            return { error: 'Error inviting organization member', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
