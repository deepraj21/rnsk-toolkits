import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBucketCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsDeleteS3Bucket = tool({
  description: 'Delete an S3 bucket... Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket to delete'),
  }),
  execute: async ({ awsCredentials, region, bucket }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new DeleteBucketCommand({ Bucket: bucket });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
