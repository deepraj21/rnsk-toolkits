import { tool } from 'ai';
import { z } from 'zod';
import { CopyObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsCopyS3Object = tool({
  description: 'Copy an object from one S3 location to another... Use it to duplicate data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The destination bucket name'),
    key: z.string().describe('The destination object key'),
    copySource: z.string().describe('The source bucket and key (e.g., bucket/key)'),
    metadataDirective: z.string().optional().describe('COPY or REPLACE'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, copySource, metadataDirective }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new CopyObjectCommand({ Bucket: bucket, Key: key, CopySource: copySource, MetadataDirective: metadataDirective as any });
      const response = await client.send(command);
      return { success: true, copyObjectResult: response.CopyObjectResult };
    } catch (err) {
      return { error: 'Failed to copy an object from one S3 location to another', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
