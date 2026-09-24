import { tool } from 'ai';
import { z } from 'zod';
import { GetObjectTaggingCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsGetS3ObjectTagging = tool({
  description: 'Get tags for an S3 object. Use it to inspect current state before making changes.',
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

      const command = new GetObjectTaggingCommand({ Bucket: bucket, Key: key, VersionId: versionId });
      const response = await client.send(command);
      return { tags: response.TagSet };
    } catch (err) {
      return { error: 'Failed to get tags for an S3 object', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
