import { tool } from 'ai';
import { z } from 'zod';
import { DeleteObjectTaggingCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsDeleteS3ObjectTagging = tool({
  description: 'Delete tags from an S3 object.. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    versionId: z.string().optional().describe('Version ID of the object'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, versionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new DeleteObjectTaggingCommand({ Bucket: bucket, Key: key, VersionId: versionId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete tags from an S3 object', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
