import { tool } from 'ai';
import { z } from 'zod';
import { CreateStreamingDistributionWithTagsCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontStreamingDistributionWithTags = tool({
  description: 'Create a CloudFront streaming distribution with tags. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    streamingDistributionConfigWithTags: z.record(z.any()).describe('Streaming distribution configuration with tags'),
  }),
  execute: async ({ awsCredentials, region, streamingDistributionConfigWithTags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateStreamingDistributionWithTagsCommand({
          StreamingDistributionConfigWithTags: streamingDistributionConfigWithTags,
      } as any);
      const response = await client.send(command);
      return {
                  streamingDistribution: response.StreamingDistribution,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront streaming distribution with tags', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
