import { tool } from 'ai';
import { z } from 'zod';
import { GetBucketIntelligentTieringConfigurationCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsGetS3BucketIntelligentTiering = tool({
  description: 'Get intelligent tiering configuration for an S3 bucket. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    id: z.string().describe('The ID of the intelligent tiering configuration'),
  }),
  execute: async ({ awsCredentials, region, bucket, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new GetBucketIntelligentTieringConfigurationCommand({ Bucket: bucket, Id: id });
      const response = await client.send(command);
      return { intelligentTiering: response.IntelligentTieringConfiguration };
    } catch (err) {
      return { error: 'Failed to get intelligent tiering configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
