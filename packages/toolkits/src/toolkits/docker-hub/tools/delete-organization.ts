// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const deleteOrganization = tool({
    description: 'Permanently delete a Docker Hub organization. Treats 404 as success (idempotent).',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        organization: z.string().describe('Organization slug/name to delete'),
    }),

    execute: async ({ dockerHubCredentials, organization }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/orgs/${encodeURIComponent(organization)}/`,
                { method: 'DELETE' },
            );

            if (result.ok || result.status === 404) {
                return {
                    status_code: result.status,
                    message:
                        result.status === 404
                            ? 'Organization not found (already deleted)'
                            : 'Organization deleted successfully',
                };
            }

            return { error: 'Failed to delete organization', details: result.data, statusCode: result.status };
        } catch (error) {
            return { error: 'Error deleting organization', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
