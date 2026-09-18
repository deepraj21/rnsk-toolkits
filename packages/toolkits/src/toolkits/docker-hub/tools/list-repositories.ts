// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const listRepositories = tool({
    description: 'List repositories under a Docker Hub namespace with optional filtering and pagination.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        namespace: z.string().describe('Docker Hub namespace'),
        page: z.number().int().min(1).optional().describe('Page number (1-indexed)'),
        page_size: z.number().int().min(1).max(100).optional().describe('Results per page'),
        ordering: z.string().optional().describe('Sort field such as last_updated or -pull_count'),
        media_types: z.string().optional().describe('Comma-separated media types filter'),
        content_types: z.string().optional().describe('Comma-separated content types filter'),
    }),

    execute: async ({ dockerHubCredentials, namespace, page, page_size, ordering, media_types, content_types }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/namespaces/${encodeURIComponent(namespace)}/repositories${buildQueryString({
                    page: page ?? 1,
                    page_size: page_size ?? 25,
                    ordering,
                    media_types,
                    content_types,
                })}`,
            );

            if (!result.ok) {
                return { error: 'Failed to list repositories', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error listing repositories', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
