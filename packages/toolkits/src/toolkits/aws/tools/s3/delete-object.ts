import { tool } from 'ai';
import { z } from 'zod';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsDeleteS3Object = tool({
  description: 'Delete an object from S3... Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
  }),
  execute: async ({ awsCredentials, region, bucket, key }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete an object from S3', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
