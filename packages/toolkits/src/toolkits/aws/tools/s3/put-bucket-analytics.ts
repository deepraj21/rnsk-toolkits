import { tool } from 'ai';
import { z } from 'zod';
import { PutBucketAnalyticsConfigurationCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsPutS3BucketAnalytics = tool({
  description: 'Set analytics configuration for an S3 bucket. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    analyticsConfiguration: z.record(z.any()).describe('Analytics configuration'),
  }),
  execute: async ({ awsCredentials, region, bucket, analyticsConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new PutBucketAnalyticsConfigurationCommand({
          Bucket: bucket,
          Id: analyticsConfiguration.Id || 'default',
          AnalyticsConfiguration: analyticsConfiguration as any
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to set analytics configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
