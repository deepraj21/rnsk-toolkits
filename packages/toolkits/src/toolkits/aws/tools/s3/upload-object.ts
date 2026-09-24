import { tool } from 'ai';
import { z } from 'zod';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsUploadS3Object = tool({
  description: 'Upload an object to S3.. Use it to store data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    content: z.string().describe('The content to upload'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, content }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new PutObjectCommand({ Bucket: bucket, Key: key, Body: content });
      const response = await client.send(command);
      return { success: true, etag: response.ETag };
    } catch (err) {
      return { error: 'Failed to upload an object to S3', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
