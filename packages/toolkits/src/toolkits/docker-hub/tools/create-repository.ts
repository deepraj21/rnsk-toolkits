// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const createRepository = tool({
    description: 'Create a new Docker Hub repository under the specified namespace.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        namespace: z.string().describe('Docker Hub username or organization namespace'),
        name: z.string().describe('Repository name'),
        is_private: z.boolean().optional().describe('Whether to create a private repository'),
        description: z.string().optional().describe('Short repository description'),
        full_description: z.string().optional().describe('Full README-style description'),
    }),

    execute: async ({ dockerHubCredentials, namespace, name, is_private, description, full_description }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/namespaces/${encodeURIComponent(namespace)}/repositories`,
                {
                    method: 'POST',
                    body: {
                        name,
                        namespace,
                        ...(is_private !== undefined ? { is_private } : {}),
                        ...(description ? { description } : {}),
                        ...(full_description ? { full_description } : {}),
                    },
                },
            );

            if (!result.ok) {
                return { error: 'Failed to create repository', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error creating repository', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
