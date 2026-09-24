import { tool } from 'ai';
import { z } from 'zod';
import { PutBucketIntelligentTieringConfigurationCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsPutS3BucketIntelligentTiering = tool({
  description: 'Set intelligent tiering configuration for an S3 bucket. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    intelligentTieringConfiguration: z.record(z.any()).describe('Intelligent tiering configuration'),
  }),
  execute: async ({ awsCredentials, region, bucket, intelligentTieringConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new PutBucketIntelligentTieringConfigurationCommand({
          Bucket: bucket,
          Id: intelligentTieringConfiguration.Id || 'default',
          IntelligentTieringConfiguration: intelligentTieringConfiguration as any
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to set intelligent tiering configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
