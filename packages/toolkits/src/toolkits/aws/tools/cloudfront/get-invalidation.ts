import { tool } from 'ai';
import { z } from 'zod';
import { GetInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsGetCloudfrontInvalidation = tool({
  description: 'Get information about a CloudFront invalidation. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    distributionId: z.string().describe('The distribution ID'),
    id: z.string().describe('The invalidation ID'),
  }),
  execute: async ({ awsCredentials, region, distributionId, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new GetInvalidationCommand({
          DistributionId: distributionId,
          Id: id,
      });
      const response = await client.send(command);
      return {
                  invalidation: response.Invalidation,
              };
    } catch (err) {
      return { error: 'Failed to get information about a CloudFront invalidation', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
