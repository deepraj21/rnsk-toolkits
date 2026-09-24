import { tool } from 'ai';
import { z } from 'zod';
import { CreateDistributionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontDistribution = tool({
  description: 'Create a new CloudFront distribution. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    distributionConfig: z.record(z.any()).describe('Distribution configuration object'),
  }),
  execute: async ({ awsCredentials, region, distributionConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateDistributionCommand({
          DistributionConfig: distributionConfig,
      } as any);
      const response = await client.send(command);
      return {
                  distribution: response.Distribution,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a new CloudFront distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
