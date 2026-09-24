import { tool } from 'ai';
import { z } from 'zod';
import { ListMultipartUploadsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsListS3MultipartUploads = tool({
  description: 'List in-progress multipart uploads. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    prefix: z.string().optional().describe('Prefix to filter uploads'),
    keyMarker: z.string().optional().describe('Key marker for pagination'),
    uploadIdMarker: z.string().optional().describe('Upload ID marker for pagination'),
    maxUploads: z.number().optional().describe('Maximum number of uploads to return'),
  }),
  execute: async ({ awsCredentials, region, bucket, prefix, keyMarker, uploadIdMarker, maxUploads }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new ListMultipartUploadsCommand({ Bucket: bucket, Prefix: prefix, KeyMarker: keyMarker, UploadIdMarker: uploadIdMarker, MaxUploads: maxUploads });
      const response = await client.send(command);
      return { uploads: response.Uploads, isTruncated: response.IsTruncated };
    } catch (err) {
      return { error: 'Failed to list in-progress multipart uploads', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
