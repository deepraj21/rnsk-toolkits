import { tool } from 'ai';
import { z } from 'zod';
import { GetDistributionConfigCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsGetCloudfrontDistributionConfig = tool({
  description: 'Get the configuration of a CloudFront distribution. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The distribution ID'),
  }),
  execute: async ({ awsCredentials, region, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new GetDistributionConfigCommand({
          Id: id,
      });
      const response = await client.send(command);
      return {
                  distributionConfig: response.DistributionConfig,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to get the configuration of a CloudFront distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
