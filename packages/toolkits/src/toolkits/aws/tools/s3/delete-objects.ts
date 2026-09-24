import { tool } from 'ai';
import { z } from 'zod';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsDeleteS3Objects = tool({
  description: 'Delete multiple objects from S3 in a single request. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    objects: z.array(z.record(z.any())).describe('Array of objects with Key and optional VersionId'),
  }),
  execute: async ({ awsCredentials, region, bucket, objects }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects } as any });
      const response = await client.send(command);
      return { deleted: response.Deleted, errors: response.Errors };
    } catch (err) {
      return { error: 'Failed to delete multiple objects from S3 in a single request', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
