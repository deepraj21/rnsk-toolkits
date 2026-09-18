// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const listTeamMembers = tool({
    description: 'List members of a Docker Hub organization team (group).',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        org_name: z.string().describe('Organization slug/name'),
        team_name: z.string().describe('Team slug/name'),
        page: z.number().int().min(1).optional().describe('Page number (1-indexed)'),
        page_size: z.number().int().min(1).max(100).optional().describe('Results per page'),
        search: z.string().optional().describe('Filter members by username, full name, or email'),
    }),

    execute: async ({ dockerHubCredentials, org_name, team_name, page, page_size, search }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/orgs/${encodeURIComponent(org_name)}/groups/${encodeURIComponent(team_name)}/members${buildQueryString({
                    page: page ?? 1,
                    page_size: page_size ?? 25,
                    search,
                })}`,
            );

            if (!result.ok) {
                return { error: 'Failed to list team members', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error listing team members', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
