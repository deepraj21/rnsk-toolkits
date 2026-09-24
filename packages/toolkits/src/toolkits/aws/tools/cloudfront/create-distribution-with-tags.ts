import { tool } from 'ai';
import { z } from 'zod';
import { CreateDistributionWithTagsCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontDistributionWithTags = tool({
  description: 'Create a CloudFront distribution with tags. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    distributionConfigWithTags: z.record(z.any()).describe('Distribution configuration with tags'),
  }),
  execute: async ({ awsCredentials, region, distributionConfigWithTags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateDistributionWithTagsCommand({
          DistributionConfigWithTags: distributionConfigWithTags,
      } as any);
      const response = await client.send(command);
      return {
                  distribution: response.Distribution,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront distribution with tags', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
