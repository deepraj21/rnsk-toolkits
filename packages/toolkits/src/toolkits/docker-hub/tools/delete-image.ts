// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const deleteImage = tool({
    description: 'Delete one or more images from a Docker Hub namespace using the bulk delete API.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        namespace: z.string().describe('Docker Hub username or organization namespace'),
        manifests: z
            .array(
                z.object({
                    repository: z.string().describe('Repository containing the image'),
                    digest: z.string().describe('SHA256 digest of the image manifest'),
                }),
            )
            .min(1)
            .max(100)
            .describe('Image manifests to delete'),
        dry_run: z.boolean().optional().describe('Validate without deleting when true'),
        ignore_warnings: z.array(z.string()).optional().describe('Warning types to ignore, e.g. is_active or current_tag'),
    }),

    execute: async ({ dockerHubCredentials, namespace, manifests, dry_run, ignore_warnings }) => {
        try {
            const result = await dockerHubRequest(
                dockerHubCredentials,
                `/v2/namespaces/${encodeURIComponent(namespace)}/delete-images`,
                {
                    method: 'POST',
                    body: {
                        dry_run: dry_run ?? false,
                        manifests,
                        ignore_warnings: ignore_warnings ?? [],
                    },
                },
            );

            if (!result.ok) {
                return { error: 'Failed to delete images', details: result.data, statusCode: result.status };
            }

            return {
                dry_run: dry_run ?? false,
                deleted_count: result.data?.deleted?.length ?? result.data?.deleted_count ?? 0,
                message: result.data?.message ?? 'Image deletion completed',
                ...result.data,
            };
        } catch (error) {
            return { error: 'Error deleting images', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
