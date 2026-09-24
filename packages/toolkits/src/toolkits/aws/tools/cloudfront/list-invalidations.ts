import { tool } from 'ai';
import { z } from 'zod';
import { ListInvalidationsCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsListCloudfrontInvalidations = tool({
  description: 'List all invalidations for a CloudFront distribution. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    distributionId: z.string().describe('The distribution ID'),
    marker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of invalidations to return'),
  }),
  execute: async ({ awsCredentials, region, distributionId, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new ListInvalidationsCommand({
          DistributionId: distributionId,
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  invalidationList: response.InvalidationList,
              };
    } catch (err) {
      return { error: 'Failed to list all invalidations for a CloudFront distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
