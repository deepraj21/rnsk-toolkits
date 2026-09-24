import { tool } from 'ai';
import { z } from 'zod';
import { UpdateStreamingDistributionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontStreamingDistribution = tool({
  description: 'Update a CloudFront streaming distribution. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    streamingDistributionConfig: z.record(z.any()).describe('Streaming distribution configuration'),
    id: z.string().describe('The streaming distribution ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, streamingDistributionConfig, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdateStreamingDistributionCommand({
          StreamingDistributionConfig: streamingDistributionConfig,
          Id: id,
          IfMatch: ifMatch,
      } as any);
      const response = await client.send(command);
      return {
                  streamingDistribution: response.StreamingDistribution,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront streaming distribution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
