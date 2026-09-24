import { tool } from 'ai';
import { z } from 'zod';
import { CreateBucketCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsCreateS3Bucket = tool({
  description: 'Create a new S3 bucket... Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket to create'),
    bucketRegion: z.string().optional().describe('Bucket location constraint (e.g. us-west-2). Defaults to the client region.'),
  }),
  execute: async ({ awsCredentials, region, bucket, bucketRegion }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new CreateBucketCommand({
          Bucket: bucket,
          CreateBucketConfiguration: bucketRegion ? { LocationConstraint: bucketRegion as any } : undefined
      });
      const response = await client.send(command);
      return { success: true, location: response.Location };
    } catch (err) {
      return { error: 'Failed to create a new S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
