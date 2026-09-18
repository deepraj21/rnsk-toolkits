// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const getTag = tool({
    description: 'Retrieve details of a specific Docker Hub repository tag.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        namespace: z.string().describe('Docker Hub namespace'),
        repository: z.string().describe('Repository name'),
        tag: z.string().describe('Tag name'),
    }),

    execute: async ({ dockerHubCredentials, namespace, repository, tag }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/namespaces/${encodeURIComponent(namespace)}/repositories/${encodeURIComponent(repository)}/tags/${encodeURIComponent(tag)}`,
            );

            if (!result.ok) {
                return { error: 'Failed to get tag', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error getting tag', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
