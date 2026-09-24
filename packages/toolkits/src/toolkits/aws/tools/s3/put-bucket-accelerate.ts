import { tool } from 'ai';
import { z } from 'zod';
import { PutBucketAccelerateConfigurationCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsPutS3BucketAccelerate = tool({
  description: 'Set the transfer acceleration configuration for an S3 bucket. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    accelerateConfiguration: z.record(z.any()).describe('Accelerate configuration'),
  }),
  execute: async ({ awsCredentials, region, bucket, accelerateConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new PutBucketAccelerateConfigurationCommand({ Bucket: bucket, AccelerateConfiguration: accelerateConfiguration });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to set the transfer acceleration configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
