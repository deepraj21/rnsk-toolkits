import { tool } from 'ai';
import { z } from 'zod';
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsRenameS3Object = tool({
  description: 'Rename an S3 object by copying and deleting. Use it to rename an object (copy then delete).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    sourceKey: z.string().describe('The current key of the object'),
    destinationKey: z.string().describe('The new key for the object'),
  }),
  execute: async ({ awsCredentials, region, bucket, sourceKey, destinationKey }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      // Copy then delete
      const copyCommand = new CopyObjectCommand({ Bucket: bucket, CopySource: `${bucket}/${sourceKey}`, Key: destinationKey });
      await client.send(copyCommand);
      const deleteCommand = new DeleteObjectCommand({ Bucket: bucket, Key: sourceKey });
      await client.send(deleteCommand);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to rename an S3 object by copying and deleting', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
