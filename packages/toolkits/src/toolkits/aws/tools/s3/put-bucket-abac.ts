import { tool } from 'ai';
import { z } from 'zod';
import { PutBucketAbacCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsPutS3BucketAbac = tool({
  description:
    'Set ABAC (Attribute-Based Access Control) status for an S3 general purpose bucket. When enabled, bucket tags can be used for access control. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    status: z.enum(['Enabled', 'Disabled']).describe('ABAC status for the bucket'),
  }),
  execute: async ({ awsCredentials, region, bucket, status }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);
      const command = new PutBucketAbacCommand({
        Bucket: bucket,
        AbacStatus: { Status: status },
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return {
        error: 'Failed to set ABAC status for an S3 bucket',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
