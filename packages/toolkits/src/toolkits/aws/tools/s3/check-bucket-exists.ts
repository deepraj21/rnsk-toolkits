import { tool } from 'ai';
import { z } from 'zod';
import { HeadBucketCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsCheckS3BucketExists = tool({
  description: 'Check if an S3 bucket exists... Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
  }),
  execute: async ({ awsCredentials, region, bucket }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      try {
          const command = new HeadBucketCommand({ Bucket: bucket });
          await client.send(command);
          return { exists: true };
      } catch (error: any) {
          return { exists: false, error: error.message };
      }
    } catch (err) {
      return { error: 'Failed to check if an S3 bucket exists', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
