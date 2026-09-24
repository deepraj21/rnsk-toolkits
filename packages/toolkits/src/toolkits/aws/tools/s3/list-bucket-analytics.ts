import { tool } from 'ai';
import { z } from 'zod';
import { ListBucketAnalyticsConfigurationsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsListS3BucketAnalytics = tool({
  description: 'List analytics configurations for an S3 bucket. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    continuationToken: z.string().optional().describe('Continuation token for pagination'),
  }),
  execute: async ({ awsCredentials, region, bucket, continuationToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new ListBucketAnalyticsConfigurationsCommand({ Bucket: bucket, ContinuationToken: continuationToken });
      const response = await client.send(command);
      return { configurations: response.AnalyticsConfigurationList, continuationToken: response.ContinuationToken };
    } catch (err) {
      return { error: 'Failed to list analytics configurations for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
