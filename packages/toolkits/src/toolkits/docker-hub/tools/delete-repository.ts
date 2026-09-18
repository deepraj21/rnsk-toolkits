// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const deleteRepository = tool({
    description: 'Permanently delete a Docker Hub repository and all its images/tags.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        namespace: z.string().describe('Docker Hub namespace that owns the repository'),
        repository: z.string().describe('Repository name to delete'),
    }),

    execute: async ({ dockerHubCredentials, namespace, repository }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/repositories/${encodeURIComponent(namespace)}/${encodeURIComponent(repository)}/`,
                { method: 'DELETE' },
            );

            if (result.ok || result.status === 404) {
                return {
                    message:
                        result.status === 404
                            ? 'Repository not found (already deleted)'
                            : 'Repository deleted successfully',
                };
            }

            return { error: 'Failed to delete repository', details: result.data, statusCode: result.status };
        } catch (error) {
            return { error: 'Error deleting repository', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
