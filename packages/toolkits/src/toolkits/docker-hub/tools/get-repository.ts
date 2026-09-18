// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const getRepository = tool({
    description: 'Retrieve detailed information about a specific Docker Hub repository.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        namespace: z.string().describe('Docker Hub namespace'),
        repository: z.string().describe('Repository name'),
    }),

    execute: async ({ dockerHubCredentials, namespace, repository }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/namespaces/${encodeURIComponent(namespace)}/repositories/${encodeURIComponent(repository)}`,
            );

            if (!result.ok) {
                return { error: 'Failed to get repository', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error getting repository', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
