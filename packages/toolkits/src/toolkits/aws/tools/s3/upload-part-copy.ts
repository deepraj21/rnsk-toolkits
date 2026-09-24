import { tool } from 'ai';
import { z } from 'zod';
import { UploadPartCopyCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsUploadS3PartCopy = tool({
  description: 'Upload a part by copying data from an existing object. Use it to store data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The destination bucket name'),
    key: z.string().describe('The destination object key'),
    uploadId: z.string().describe('The upload ID from create_multipart_upload'),
    partNumber: z.number().describe('Part number (1-based)'),
    copySource: z.string().describe('The source bucket and key'),
    copySourceRange: z.string().optional().describe('Byte range to copy (e.g., bytes=0-1048575)'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, uploadId, partNumber, copySource, copySourceRange }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new UploadPartCopyCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber, CopySource: copySource, CopySourceRange: copySourceRange });
      const response = await client.send(command);
      return { copyPartResult: response.CopyPartResult, partNumber };
    } catch (err) {
      return { error: 'Failed to upload a part by copying data from an existing object', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
