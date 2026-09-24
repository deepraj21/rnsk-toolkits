import { tool } from 'ai';
import { z } from 'zod';
import { UpdateBucketMetadataInventoryTableConfigurationCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsUpdateS3BucketMetadataInventoryTable = tool({
  description: 'Update metadata inventory table configuration for an S3 bucket. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    metadataInventoryTableConfiguration: z.record(z.any()).describe('Metadata inventory table configuration'),
  }),
  execute: async ({ awsCredentials, region, bucket, metadataInventoryTableConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new UpdateBucketMetadataInventoryTableConfigurationCommand({ Bucket: bucket, InventoryTableConfiguration: metadataInventoryTableConfiguration as any });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to update metadata inventory table configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
