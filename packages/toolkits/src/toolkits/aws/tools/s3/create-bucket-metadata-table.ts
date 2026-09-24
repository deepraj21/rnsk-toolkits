import { tool } from 'ai';
import { z } from 'zod';
import { CreateBucketMetadataTableConfigurationCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsCreateS3BucketMetadataTable = tool({
  description: 'Create metadata table configuration for an S3 bucket. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    metadataTableConfiguration: z.record(z.any()).describe('Metadata table configuration'),
  }),
  execute: async ({ awsCredentials, region, bucket, metadataTableConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new CreateBucketMetadataTableConfigurationCommand({ Bucket: bucket, MetadataTableConfiguration: metadataTableConfiguration as any });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to create metadata table configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
