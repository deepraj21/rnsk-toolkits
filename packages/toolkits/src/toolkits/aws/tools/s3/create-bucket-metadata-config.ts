import { tool } from 'ai';
import { z } from 'zod';
import { CreateBucketMetadataConfigurationCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsCreateS3BucketMetadataConfig = tool({
  description: 'Create metadata configuration for an S3 bucket. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    metadataConfiguration: z.record(z.any()).describe('Metadata configuration'),
  }),
  execute: async ({ awsCredentials, region, bucket, metadataConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new CreateBucketMetadataConfigurationCommand({ Bucket: bucket, MetadataConfiguration: metadataConfiguration as any });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to create metadata configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
