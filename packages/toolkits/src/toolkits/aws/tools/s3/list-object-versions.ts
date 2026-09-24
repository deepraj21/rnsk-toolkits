import { tool } from 'ai';
import { z } from 'zod';
import { ListObjectVersionsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsListS3ObjectVersions = tool({
  description: 'List all versions of objects in an S3 bucket.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    prefix: z.string().optional().describe('Prefix to filter objects'),
    keyMarker: z.string().optional().describe('Key marker for pagination'),
    versionIdMarker: z.string().optional().describe('Version ID marker for pagination'),
    maxKeys: z.number().optional().describe('Maximum number of keys to return'),
  }),
  execute: async ({ awsCredentials, region, bucket, prefix, keyMarker, versionIdMarker, maxKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new ListObjectVersionsCommand({ Bucket: bucket, Prefix: prefix, KeyMarker: keyMarker, VersionIdMarker: versionIdMarker, MaxKeys: maxKeys });
      const response = await client.send(command);
      return { versions: response.Versions, deleteMarkers: response.DeleteMarkers, isTruncated: response.IsTruncated };
    } catch (err) {
      return { error: 'Failed to list all versions of objects in an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
