import { tool } from 'ai';
import { z } from 'zod';
import { UpdateCachePolicyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontCachePolicy = tool({
  description: 'Update a CloudFront cache policy. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cachePolicyConfig: z.record(z.any()).describe('Cache policy configuration'),
    id: z.string().describe('The cache policy ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, cachePolicyConfig, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdateCachePolicyCommand({
          CachePolicyConfig: cachePolicyConfig,
          Id: id,
          IfMatch: ifMatch,
      } as any);
      const response = await client.send(command);
      return {
                  cachePolicy: response.CachePolicy,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront cache policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
