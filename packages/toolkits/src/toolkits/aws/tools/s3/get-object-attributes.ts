import { tool } from 'ai';
import { z } from 'zod';
import { GetObjectAttributesCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsGetS3ObjectAttributes = tool({
  description: 'Retrieve attributes of an S3 object. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    objectAttributes: z.array(z.string()).describe('Array of attributes to retrieve (ETag, Checksum, ObjectParts, StorageClass, ObjectSize)'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, objectAttributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new GetObjectAttributesCommand({ Bucket: bucket, Key: key, ObjectAttributes: objectAttributes as any });
      const response = await client.send(command);
      return { attributes: response };
    } catch (err) {
      return { error: 'Failed to retrieve attributes of an S3 object', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
