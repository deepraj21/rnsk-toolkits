import { tool } from 'ai';
import { z } from 'zod';
import { ListObjectsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsListS3ObjectsV1 = tool({
  description: 'List objects in an S3 bucket (v1 API). Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    prefix: z.string().optional().describe('Prefix to filter objects'),
    marker: z.string().optional().describe('Marker for pagination'),
    maxKeys: z.number().optional().describe('Maximum number of keys to return'),
  }),
  execute: async ({ awsCredentials, region, bucket, prefix, marker, maxKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new ListObjectsCommand({ Bucket: bucket, Prefix: prefix, Marker: marker, MaxKeys: maxKeys });
      const response = await client.send(command);
      return { objects: response.Contents, isTruncated: response.IsTruncated, nextMarker: response.NextMarker };
    } catch (err) {
      return { error: 'Failed to list objects in an S3 bucket (v1 API)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
