// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const listOrgAccessTokens = tool({
    description: 'List organization access tokens for a Docker Hub organization.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        name: z.string().describe('Organization name'),
        page: z.number().int().min(1).optional().describe('Page number (1-indexed)'),
        page_size: z.number().int().min(1).max(100).optional().describe('Results per page'),
    }),

    execute: async ({ dockerHubCredentials, name, page, page_size }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/orgs/${encodeURIComponent(name)}/access-tokens${buildQueryString({ page: page ?? 1, page_size: page_size ?? 10 })}`,
            );

            if (!result.ok) {
                return { error: 'Failed to list organization access tokens', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error listing organization access tokens', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
