import { tool } from 'ai';
import { z } from 'zod';
import { UpdateBucketMetadataJournalTableConfigurationCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsUpdateS3BucketMetadataJournalTable = tool({
  description: 'Update metadata journal table configuration for an S3 bucket. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    metadataJournalTableConfiguration: z.record(z.any()).describe('Metadata journal table configuration'),
  }),
  execute: async ({ awsCredentials, region, bucket, metadataJournalTableConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new UpdateBucketMetadataJournalTableConfigurationCommand({ Bucket: bucket, JournalTableConfiguration: metadataJournalTableConfiguration as any });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to update metadata journal table configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
