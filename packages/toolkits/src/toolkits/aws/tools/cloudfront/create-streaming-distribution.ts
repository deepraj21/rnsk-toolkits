import { tool } from 'ai';
import { z } from 'zod';
import { CreateStreamingDistributionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontStreamingDistribution = tool({
  description: 'Create a CloudFront streaming distribution. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    streamingDistributionConfig: z.record(z.any()).describe('Streaming distribution configuration'),
  }),
  execute: async ({ awsCredentials, region, streamingDistributionConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateStreamingDistributionCommand({
          StreamingDistributionConfig: streamingDistributionConfig,
      } as any);
      const response = await client.send(command);
      return {
                  streamingDistribution: response.StreamingDistribution,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront streaming distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
