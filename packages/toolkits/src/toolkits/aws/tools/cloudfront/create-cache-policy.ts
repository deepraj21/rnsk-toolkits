import { tool } from 'ai';
import { z } from 'zod';
import { CreateCachePolicyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontCachePolicy = tool({
  description: 'Create a CloudFront cache policy. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cachePolicyConfig: z.record(z.any()).describe('Cache policy configuration'),
  }),
  execute: async ({ awsCredentials, region, cachePolicyConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateCachePolicyCommand({
          CachePolicyConfig: cachePolicyConfig,
      } as any);
      const response = await client.send(command);
      return {
                  cachePolicy: response.CachePolicy,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront cache policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
