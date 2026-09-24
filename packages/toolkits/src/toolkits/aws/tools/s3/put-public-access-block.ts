import { tool } from 'ai';
import { z } from 'zod';
import { PutPublicAccessBlockCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsPutS3PublicAccessBlock = tool({
  description: 'Set public access block configuration for an S3 bucket.. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    publicAccessBlockConfiguration: z.record(z.any()).describe('Public access block configuration'),
  }),
  execute: async ({ awsCredentials, region, bucket, publicAccessBlockConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new PutPublicAccessBlockCommand({ Bucket: bucket, PublicAccessBlockConfiguration: publicAccessBlockConfiguration });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to set public access block configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
