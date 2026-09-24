import { tool } from 'ai';
import { z } from 'zod';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsGetS3Object = tool({
  description: 'Retrieve an object from S3.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
  }),
  execute: async ({ awsCredentials, region, bucket, key }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await client.send(command);
      const content = await response.Body?.transformToString();
      return { content: content || '' };
    } catch (err) {
      return { error: 'Failed to retrieve an object from S3', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
