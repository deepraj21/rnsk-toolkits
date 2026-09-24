import { tool } from 'ai';
import { z } from 'zod';
import { ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsListCloudfrontDistributions = tool({
  description: 'List all CloudFront distributions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    marker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of distributions to return'),
  }),
  execute: async ({ awsCredentials, region, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new ListDistributionsCommand({
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  distributionList: response.DistributionList,
              };
    } catch (err) {
      return { error: 'Failed to list all CloudFront distributions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
