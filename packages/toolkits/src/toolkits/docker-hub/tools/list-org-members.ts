// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const listOrgMembers = tool({
    description: 'List members of a Docker Hub organization with roles and team assignments.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        org: z.string().describe('Organization name'),
        page: z.number().int().min(1).optional().describe('Page number (1-indexed)'),
        page_size: z.number().int().min(1).max(100).optional().describe('Results per page'),
    }),

    execute: async ({ dockerHubCredentials, org, page, page_size }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/orgs/${encodeURIComponent(org)}/members${buildQueryString({ page: page ?? 1, page_size: page_size ?? 25 })}`,
            );

            if (!result.ok) {
                return { error: 'Failed to list organization members', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error listing organization members', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
