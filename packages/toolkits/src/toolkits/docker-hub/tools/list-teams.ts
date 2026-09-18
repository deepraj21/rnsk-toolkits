// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const listTeams = tool({
    description: 'List all teams (groups) within a Docker Hub organization.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        organization: z.string().describe('Organization slug/name'),
        page: z.number().int().min(1).optional().describe('Page number (1-indexed)'),
        page_size: z.number().int().min(1).max(100).optional().describe('Results per page'),
    }),

    execute: async ({ dockerHubCredentials, organization, page, page_size }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/orgs/${encodeURIComponent(organization)}/groups${buildQueryString({ page: page ?? 1, page_size: page_size ?? 25 })}`,
            );

            if (!result.ok) {
                return { error: 'Failed to list teams', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error listing teams', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
