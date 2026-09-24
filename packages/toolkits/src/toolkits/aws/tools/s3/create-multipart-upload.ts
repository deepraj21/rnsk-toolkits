import { tool } from 'ai';
import { z } from 'zod';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsCreateS3MultipartUpload = tool({
  description: 'Initiate a multipart upload to S3.. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    contentType: z.string().optional().describe('Content type of the object'),
    metadata: z.record(z.any()).optional().describe('Metadata for the object'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, contentType, metadata }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType, Metadata: metadata });
      const response = await client.send(command);
      return { uploadId: response.UploadId, bucket: response.Bucket, key: response.Key };
    } catch (err) {
      return { error: 'Failed to initiate a multipart upload to S3', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
