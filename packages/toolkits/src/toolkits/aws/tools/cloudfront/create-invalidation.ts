import { tool } from 'ai';
import { z } from 'zod';
import { CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontInvalidation = tool({
  description: 'Create a CloudFront invalidation. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    distributionId: z.string().describe('The distribution ID'),
    invalidationBatch: z.record(z.any()).describe('Invalidation batch object with paths and caller reference'),
  }),
  execute: async ({ awsCredentials, region, distributionId, invalidationBatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateInvalidationCommand({
          DistributionId: distributionId,
          InvalidationBatch: invalidationBatch,
      } as any);
      const response = await client.send(command);
      return {
                  invalidation: response.Invalidation,
                  location: response.Location,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront invalidation', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
