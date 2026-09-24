import { tool } from 'ai';
import { z } from 'zod';
import { ListStreamingDistributionsCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsListCloudfrontStreamingDistributions = tool({
  description: 'List all CloudFront streaming distributions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    marker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of streaming distributions to return'),
  }),
  execute: async ({ awsCredentials, region, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new ListStreamingDistributionsCommand({
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  streamingDistributionList: response.StreamingDistributionList,
              };
    } catch (err) {
      return { error: 'Failed to list all CloudFront streaming distributions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
