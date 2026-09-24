import { tool } from 'ai';
import { z } from 'zod';
import { ListPartsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsListS3Parts = tool({
  description: 'List parts that have been uploaded for a multipart upload.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    uploadId: z.string().describe('The upload ID from create_multipart_upload'),
    partNumberMarker: z.number().optional().describe('Part number marker for pagination'),
    maxParts: z.number().optional().describe('Maximum number of parts to return'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, uploadId, partNumberMarker, maxParts }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new ListPartsCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumberMarker: partNumberMarker?.toString(), MaxParts: maxParts });
      const response = await client.send(command);
      return { parts: response.Parts, isTruncated: response.IsTruncated };
    } catch (err) {
      return { error: 'Failed to list parts that have been uploaded for a multipart upload', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
