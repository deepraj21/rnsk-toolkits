import { tool } from 'ai';
import { z } from 'zod';
import { PutObjectTaggingCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsPutS3ObjectTagging = tool({
  description: 'Set tags for an S3 object.. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    tagging: z.record(z.any()).describe('Tagging configuration with TagSet array'),
    versionId: z.string().optional().describe('Version ID of the object'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, tagging, versionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new PutObjectTaggingCommand({ Bucket: bucket, Key: key, Tagging: tagging as any, VersionId: versionId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to set tags for an S3 object', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
