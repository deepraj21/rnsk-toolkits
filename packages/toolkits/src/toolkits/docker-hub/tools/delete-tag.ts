// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const deleteTag = tool({
    description: 'Permanently delete a specific tag from a Docker Hub repository.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        namespace: z.string().describe('Docker Hub namespace'),
        repository: z.string().describe('Repository name'),
        tag: z.string().describe('Tag name to delete'),
    }),

    execute: async ({ dockerHubCredentials, namespace, repository, tag }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/namespaces/${encodeURIComponent(namespace)}/repositories/${encodeURIComponent(repository)}/tags/${encodeURIComponent(tag)}`,
                { method: 'DELETE' },
            );

            if (result.ok || result.status === 404) {
                return {
                    success: true,
                    message: `Tag '${tag}' deleted from ${namespace}/${repository}`,
                };
            }

            return { error: 'Failed to delete tag', details: result.data, statusCode: result.status };
        } catch (error) {
            return { error: 'Error deleting tag', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
