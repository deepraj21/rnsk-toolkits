import { tool } from 'ai';
import { z } from 'zod';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsCompleteS3MultipartUpload = tool({
  description: 'Complete a multipart upload',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    uploadId: z.string().describe('The upload ID from create_multipart_upload'),
    parts: z.array(z.record(z.any())).describe('Array of parts with ETag and PartNumber'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, uploadId, parts }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new CompleteMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId, MultipartUpload: { Parts: parts } });
      const response = await client.send(command);
      return { success: true, location: response.Location, etag: response.ETag };
    } catch (err) {
      return { error: 'Failed to complete a multipart upload', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
