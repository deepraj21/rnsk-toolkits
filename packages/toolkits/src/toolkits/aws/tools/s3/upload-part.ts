import { tool } from 'ai';
import { z } from 'zod';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsUploadS3Part = tool({
  description: 'Upload a part in a multipart upload. Use it to store data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    uploadId: z.string().describe('The upload ID from create_multipart_upload'),
    partNumber: z.number().describe('Part number (1-based)'),
    body: z.string().describe('The part data to upload'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, uploadId, partNumber, body }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber, Body: body });
      const response = await client.send(command);
      return { etag: response.ETag, partNumber };
    } catch (err) {
      return { error: 'Failed to upload a part in a multipart upload', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
