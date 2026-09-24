import { tool } from 'ai';
import { z } from 'zod';
import { GetBucketEncryptionCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsGetS3BucketEncryption = tool({
  description: 'Get the encryption configuration for an S3 bucket. Use it to inspect current state before making changes.',
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

      const command = new GetBucketEncryptionCommand({ Bucket: bucket });
      const response = await client.send(command);
      return { encryption: response.ServerSideEncryptionConfiguration };
    } catch (err) {
      return { error: 'Failed to get the encryption configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
