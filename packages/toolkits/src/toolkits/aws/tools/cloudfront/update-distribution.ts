import { tool } from 'ai';
import { z } from 'zod';
import { UpdateDistributionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontDistribution = tool({
  description: 'Update a CloudFront distribution. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    distributionConfig: z.record(z.any()).describe('Distribution configuration object'),
    id: z.string().describe('The distribution ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, distributionConfig, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdateDistributionCommand({
          DistributionConfig: distributionConfig,
          Id: id,
          IfMatch: ifMatch,
      } as any);
      const response = await client.send(command);
      return {
                  distribution: response.Distribution,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
