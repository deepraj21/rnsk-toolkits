// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const getImage = tool({
    description: 'Retrieve details about a platform-specific image variant by SHA256 digest.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        namespace: z.string().describe('Docker Hub namespace'),
        repository: z.string().describe('Repository name'),
        digest: z.string().describe('SHA256 digest of the image variant'),
    }),

    execute: async ({ dockerHubCredentials, namespace, repository, digest }) => {
        try {
            let page = 1;
            while (page <= 50) {
                const result = await dockerHubRequest(
                    dockerHubCredentials,
                    `/v2/repositories/${encodeURIComponent(namespace)}/${encodeURIComponent(repository)}/tags/${buildQueryString({ page, page_size: 100 })}`,
                );

                if (!result.ok) {
                    return { error: 'Failed to list repository tags while searching for image', details: result.data, statusCode: result.status };
                }

                const tags = result.data?.results ?? [];
                for (const tag of tags) {
                    for (const image of tag.images ?? []) {
                        if (image.digest === digest) {
                            return {
                                digest: image.digest,
                                architecture: image.architecture,
                                os: image.os,
                                size: image.size,
                                status: image.status,
                                variant: image.variant,
                                os_version: image.os_version,
                                last_pulled: image.last_pulled,
                                last_pushed: image.last_pushed,
                                tag_name: tag.name,
                            };
                        }
                    }
                }

                if (!result.data?.next) break;
                page += 1;
            }

            return { error: 'Image digest not found in repository tags', digest, namespace, repository };
        } catch (error) {
            return { error: 'Error getting image details', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
